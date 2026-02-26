///|
/// 簡易乱数生成器（xorshift32）
priv struct Rng {
  mut state : UInt
}

///|
let rng : Rng = { state: 12345U }

///|
/// 乱数シードを設定
pub fn seed_rng(s : UInt) -> Unit {
  rng.state = if s == 0U { 1U } else { s }
}

///|
/// 0..n-1 の乱数を返す
pub fn rand_int(n : Int) -> Int {
  let mut x = rng.state
  x = x ^ (x << 13)
  x = x ^ (x >> 17)
  x = x ^ (x << 5)
  rng.state = x
  (x.reinterpret_as_int().land(0x7fffffff) % n).abs()
}

///|
/// 配列をシャッフル
fn[T] shuffle(arr : Array[T]) -> Unit {
  let len = arr.length()
  for i = len - 1; i > 0; i = i - 1 {
    let j = rand_int(i + 1)
    arr.swap(i, j)
  }
}

///|
/// 新しいゲームを初期化
pub fn new_game(difficulty : Int) -> GameState {
  let enemy_hp = 30 + difficulty * 12
  let spins = 3 + difficulty / 3
  // 山札を構築
  let pool = all_card_kinds()
  shuffle(pool)
  let deck : Array[Card] = []
  for kind in pool {
    deck.push(card_data(kind))
  }
  // 初期手札を3枚引く
  let hand : Array[Card] = []
  for _ in 0..<3 {
    if deck.length() > 0 {
      let idx = rand_int(deck.length())
      hand.push(deck.remove(idx))
    }
  }
  {
    spins_left: spins,
    enemy_hp,
    enemy_max_hp: enemy_hp,
    hand,
    deck,
    cards_played: 0,
    buffs: Buffs::new(),
    phase: Playing,
    total_damage: 0,
    logs: [],
    slot_result: { left_pos: 0, center_pos: 0, right_pos: 0 },
  }
}

///|
/// スピン開始（結果を生成し、Spinningフェーズに遷移）
/// アニメーション完了後にresolve_current_spinを呼ぶ
pub fn start_spin(state : GameState) -> Bool {
  if state.phase != Playing || state.spins_left <= 0 {
    return false
  }
  state.spins_left -= 1
  let result = spin()
  state.slot_result = result
  state.phase = Spinning
  true
}

///|
/// アニメーション完了後にスロット結果を解決する
pub fn resolve_current_spin(state : GameState) -> Unit {
  if state.phase != Spinning {
    return
  }
  state.phase = Playing
  let result = state.slot_result
  // スロット結果ログ（子役判定）
  let (koyaku_id, _) = judge_koyaku(result)
  let (_, center_sym, _) = get_center_symbols(result)
  state.logs.push({
    card_id: symbol_to_id(center_sym),
    damage: koyaku_id,
    log_type: 3,
  })
  resolve_slot(state, result)
  // スピン残り0 かつ Playing のままなら自動ターン終了
  if state.spins_left <= 0 && state.phase == Playing {
    end_turn(state)
  }
}

///|
/// 手札のカードをプレイ（Seven出目時のカード選択）
pub fn play_card(state : GameState, index : Int) -> Bool {
  if state.phase != Choosing {
    return false
  }
  if index < 0 || index >= state.hand.length() {
    return false
  }
  let card = state.hand[index]
  state.cards_played += 1
  let card_id = card_kind_to_id(card.kind)
  // オール7ならダメージ3倍
  let (koyaku, _) = judge_koyaku(state.slot_result)
  let seven_bonus = koyaku == 0 // 子役ID 0 = 7揃い
  let damage = apply_card_effect(state, card)
  let final_damage = if seven_bonus { damage * 3 } else { damage }
  if final_damage > 0 {
    state.enemy_hp -= final_damage
    state.total_damage += final_damage
    state.logs.push({ card_id, damage: final_damage, log_type: 0 })
  } else {
    state.logs.push({ card_id, damage: 0, log_type: 1 })
  }
  state.hand.remove(index) |> ignore
  if state.enemy_hp <= 0 {
    state.enemy_hp = 0
    state.phase = Victory
  } else if state.spins_left <= 0 {
    end_turn(state)
  } else {
    state.phase = Playing
  }
  true
}

///|
/// カード効果を適用し、与えるダメージを返す
fn apply_card_effect(state : GameState, card : Card) -> Int {
  match card.kind {
    PowerUp => {
      state.buffs.damage_multiplier *= 2
      0
    }
    Critical => {
      state.buffs.damage_multiplier *= 3
      0
    }
    Rage => {
      state.buffs.flat_damage_bonus += 5
      0
    }
    Drain => {
      let dmg = calc_damage(state, card.base_damage)
      draw_card(state)
      dmg
    }
    Combo => {
      let combo_damage = 3 * state.cards_played
      calc_damage(state, combo_damage)
    }
    _ => calc_damage(state, card.base_damage)
  }
}

///|
/// バフを考慮したダメージ計算
fn calc_damage(state : GameState, base : Int) -> Int {
  let dmg = (base + state.buffs.flat_damage_bonus) * state.buffs.damage_multiplier
  state.buffs.damage_multiplier = 1
  dmg
}

///|
/// ターン終了
pub fn end_turn(state : GameState) -> Unit {
  if state.phase == Playing || state.phase == Choosing {
    if state.enemy_hp > 0 {
      state.phase = Defeat
    }
  }
}

///|
/// カードのID（JSとの連携用）
pub fn card_kind_to_id(kind : CardKind) -> Int {
  match kind {
    Strike => 0
    HeavyStrike => 1
    Fireball => 2
    QuickStrike => 3
    PowerUp => 4
    Rage => 5
    Critical => 6
    Drain => 7
    Combo => 8
    Shield_Bash => 9
  }
}

///|
/// ログ数を返す
pub fn log_count(state : GameState) -> Int {
  state.logs.length()
}

///|
/// 指定インデックスのログを返す
pub fn get_log(state : GameState, index : Int) -> LogEntry {
  state.logs[index]
}
