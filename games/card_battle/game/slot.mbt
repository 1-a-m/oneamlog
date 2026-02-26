///|
/// リール配列（各20コマ）
let reel_strips : Array[Array[Symbol]] = [
  // 左リール: Cherry×9, Bell×5, BAR×1, Replay×3, Seven×2
  [Cherry, Bell, Cherry, Replay, Cherry, Bell, Cherry, Seven, Cherry, Bell,
   Replay, Cherry, Bar, Cherry, Bell, Cherry, Replay, Bell, Cherry, Seven],
  // 中リール: Cherry×6, Bell×5, BAR×1, Replay×4, Seven×2 (やや偏りあり)
  [Bell, Cherry, Replay, Cherry, Bell, Bar, Cherry, Bell, Replay, Cherry,
   Seven, Bell, Cherry, Replay, Bell, Cherry, Bell, Cherry, Seven, Replay],
  // 右リール: Cherry×7, Bell×5, BAR×1, Replay×3, Seven×3 (やや7多め)
  [Cherry, Bell, Cherry, Bell, Replay, Cherry, Bell, Cherry, Seven, Cherry,
   Bell, Replay, Cherry, Bell, Cherry, Bar, Cherry, Bell, Replay, Seven],
]

///|
/// リールのコマ数
let reel_size : Int = 20

///|
/// リール配列からシンボルを取得（位置は循環）
pub fn get_reel_symbol(reel_index : Int, pos : Int) -> Symbol {
  let strip = reel_strips[reel_index]
  let wrapped = ((pos % reel_size) + reel_size) % reel_size
  strip[wrapped]
}

///|
/// SlotResult から中段シンボルを取得
pub fn get_center_symbols(result : SlotResult) -> (Symbol, Symbol, Symbol) {
  let left = get_reel_symbol(0, result.left_pos)
  let center = get_reel_symbol(1, result.center_pos)
  let right = get_reel_symbol(2, result.right_pos)
  (left, center, right)
}

///|
/// 3リールを回してスロット結果を返す（停止位置をランダム選択）
pub fn spin() -> SlotResult {
  {
    left_pos: rand_int(reel_size),
    center_pos: rand_int(reel_size),
    right_pos: rand_int(reel_size),
  }
}

///|
/// 子役判定（優先度順）
/// 戻り値: (子役ID, ダメージ/効果値)
/// 子役ID: 0=7揃い, 1=BAR揃い, 2=ベル揃い, 3=リプレイ, 4=強チェリー, 5=弱チェリー, 6=ハズレ
pub fn judge_koyaku(result : SlotResult) -> (Int, Int) {
  let (left, center, right) = get_center_symbols(result)
  // 7揃い
  if left == Seven && center == Seven && right == Seven {
    return (0, 0) // ダメージはカード発動で決まる
  }
  // BAR揃い
  if left == Bar && center == Bar && right == Bar {
    return (1, 20)
  }
  // ベル揃い
  if left == Bell && center == Bell && right == Bell {
    return (2, 10)
  }
  // リプレイ揃い
  if left == Replay && center == Replay && right == Replay {
    return (3, 1) // スピン+1
  }
  // 強チェリー（左🍒 + 右7️⃣）
  if left == Cherry && right == Seven {
    return (4, 8)
  }
  // 弱チェリー（左🍒）
  if left == Cherry {
    return (5, 4)
  }
  // ハズレ
  (6, 2)
}

///|
/// スロット結果を解決し、効果を適用する
pub fn resolve_slot(state : GameState, result : SlotResult) -> Unit {
  let (koyaku_id, value) = judge_koyaku(result)
  match koyaku_id {
    0 => {
      // 7揃い: 手札からカード選択
      if state.hand.length() > 0 {
        state.phase = Choosing
      }
    }
    1 | 2 | 4 | 5 | 6 => {
      // ダメージ系子役 (BAR, ベル, 強チェリー, 弱チェリー, ハズレ)
      let dmg = calc_slot_damage(state, value)
      state.enemy_hp -= dmg
      state.total_damage += dmg
      state.logs.push({ card_id: -1, damage: dmg, log_type: 0 })
      // 強チェリーは追加で1枚ドロー
      if koyaku_id == 4 {
        draw_card(state)
        state.logs.push({ card_id: -1, damage: 1, log_type: 2 })
      }
    }
    3 => {
      // リプレイ: スピン+1
      state.spins_left += 1
      state.logs.push({ card_id: -1, damage: 1, log_type: 2 })
    }
    _ => ()
  }
  if state.enemy_hp <= 0 {
    state.enemy_hp = 0
    state.phase = Victory
  }
}

///|
/// スロットダメージ計算（バフ適用）
fn calc_slot_damage(state : GameState, base : Int) -> Int {
  let dmg = (base + state.buffs.flat_damage_bonus) * state.buffs.damage_multiplier
  state.buffs.damage_multiplier = 1
  dmg
}

///|
/// 山札からカードを1枚引いて手札に加える
pub fn draw_card(state : GameState) -> Unit {
  if state.deck.length() > 0 {
    let index = rand_int(state.deck.length())
    let card = state.deck.remove(index)
    state.hand.push(card)
  }
}

///|
/// シンボルのID（JS連携用）
pub fn symbol_to_id(sym : Symbol) -> Int {
  match sym {
    Cherry => 0
    Bell => 1
    Bar => 2
    Replay => 3
    Seven => 4
  }
}
