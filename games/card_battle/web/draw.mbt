///|
/// キャンバスサイズ
let canvas_w : Double = 800.0

///|
let canvas_h : Double = 600.0

///|
/// カード描画定数
let card_w : Double = 90.0

///|
let card_h : Double = 120.0

///|
let card_gap : Double = 10.0

///|
/// リール描画定数
let reel_w : Double = 70.0

///|
/// 1シンボルの高さ
let sym_h : Double = 50.0

///|
/// リール表示高さ（3行分）
let reel_h : Double = 150.0

///|
let reel_gap : Double = 16.0

///|
/// テキストID定数（JSと共有）
/// 0-9: カード名, 10-19: カード説明
/// 100: "SPIN", 101: "HP:", 102: "VICTORY!", 103: "DEFEAT..."
/// 104: "クリックでリトライ", 105: (未使用)
/// 106: "合計ダメージ:", 107: "残りHP:"
/// 108: "カードを選んでください"
/// 109: "SPIN:"
/// 110: "バトルログ"
/// 200-204: シンボル名 (Cherry, Bell, BAR, Replay, 7)

///|
/// 画面全体を描画
pub fn draw_all(state : @game.GameState) -> Unit {
  // 背景クリア
  js_set_fill_color(18, 18, 30, 1.0)
  js_fill_rect(0.0, 0.0, canvas_w, canvas_h)
  // 敵を描画
  draw_enemy(state)
  // スピン回数表示
  draw_spins(state)
  // リール表示
  draw_reels(state)
  // 手札を描画
  draw_hand(state)
  // ログを描画
  draw_log(state)
  // オーバーレイ（ボタン・勝敗）
  draw_phase_overlay(state)
}

///|
/// 敵の描画
fn draw_enemy(state : @game.GameState) -> Unit {
  let ex = 350.0
  let ey = 20.0
  let ew = 100.0
  let eh = 80.0
  // 敵の体
  js_set_fill_color(180, 40, 40, 1.0)
  js_round_rect(ex, ey, ew, eh, 12.0)
  // HPバー背景
  let bar_x = 300.0
  let bar_y = 110.0
  let bar_w = 200.0
  let bar_h = 18.0
  js_set_fill_color(60, 20, 20, 1.0)
  js_fill_rect(bar_x, bar_y, bar_w, bar_h)
  // HPバー
  let hp_ratio = if state.enemy_max_hp > 0 {
    state.enemy_hp.to_double() / state.enemy_max_hp.to_double()
  } else {
    0.0
  }
  let hp_color_r = if hp_ratio > 0.5 { 40 } else { 200 }
  let hp_color_g = if hp_ratio > 0.5 {
    180
  } else if hp_ratio > 0.25 {
    160
  } else {
    40
  }
  js_set_fill_color(hp_color_r, hp_color_g, 40, 1.0)
  js_fill_rect(bar_x, bar_y, bar_w * hp_ratio, bar_h)
  // HPバー枠
  js_set_stroke_color(200, 200, 200, 1.0)
  js_set_line_width(1.0)
  js_stroke_rect(bar_x, bar_y, bar_w, bar_h)
  // HP数値
  js_set_fill_color(255, 255, 255, 1.0)
  js_set_font(14, 1)
  js_draw_text(101, bar_x + bar_w + 10.0, bar_y + 10.0)
  js_draw_number(state.enemy_hp, bar_x + bar_w + 45.0, bar_y + 10.0)
}

///|
/// スピン回数表示
fn draw_spins(state : @game.GameState) -> Unit {
  let sx = 20.0
  let sy = 20.0
  js_set_fill_color(50, 30, 80, 1.0)
  js_round_rect(sx, sy, 100.0, 35.0, 8.0)
  js_set_fill_color(200, 150, 255, 1.0)
  js_set_font(14, 1)
  js_draw_text(109, sx + 35.0, sy + 18.0)
  js_set_fill_color(255, 220, 100, 1.0)
  js_set_font(18, 1)
  js_draw_number(state.spins_left, sx + 78.0, sy + 18.0)
}

///|
/// リール表示（3つのリール枠 × 3行シンボル）
fn draw_reels(state : @game.GameState) -> Unit {
  let total_w = 3.0 * reel_w + 2.0 * reel_gap
  let start_x = (canvas_w - total_w) / 2.0
  let ry = 140.0
  // リール枠背景
  js_set_fill_color(10, 10, 20, 1.0)
  js_round_rect(
    start_x - 10.0,
    ry - 10.0,
    total_w + 20.0,
    reel_h + 20.0,
    12.0,
  )
  let is_spinning = state.phase == @game.Spinning
  // 各リール
  for i in 0..<3 {
    let x = start_x + i.to_double() * (reel_w + reel_gap)
    // リール背景
    js_set_fill_color(25, 20, 40, 1.0)
    js_round_rect(x, ry, reel_w, reel_h, 6.0)
    // リール枠
    js_set_stroke_color(80, 60, 120, 1.0)
    js_set_line_width(1.0)
    js_stroke_rect(x, ry, reel_w, reel_h)
    // Spinning中はJS側がアニメーション描画するのでシンボル非表示
    if not(is_spinning) {
      let pos = match i {
        0 => state.slot_result.left_pos
        1 => state.slot_result.center_pos
        _ => state.slot_result.right_pos
      }
      // 上段・中段・下段を描画
      for row in 0..<3 {
        let sym_pos = pos - 1 + row // -1=上段, 0=中段, +1=下段
        let sym = @game.get_reel_symbol(i, sym_pos)
        let sym_id = @game.symbol_to_id(sym)
        let cy = ry + sym_h * row.to_double() + sym_h / 2.0
        if row == 1 {
          draw_symbol_bright(sym_id, x + reel_w / 2.0, cy)
        } else {
          draw_symbol_dim(sym_id, x + reel_w / 2.0, cy)
        }
      }
    }
  }
  // 中段ライン（判定ライン）
  let line_y = ry + sym_h
  js_set_stroke_color(255, 200, 60, 0.6)
  js_set_line_width(2.0)
  js_stroke_rect(start_x - 5.0, line_y, total_w + 10.0, sym_h)
}

///|
/// シンボルを明るく描画（中段用）
fn draw_symbol_bright(sym_id : Int, cx : Double, cy : Double) -> Unit {
  match sym_id {
    0 => js_set_fill_color(255, 80, 80, 1.0)
    1 => js_set_fill_color(255, 215, 0, 1.0)
    2 => js_set_fill_color(200, 100, 255, 1.0)
    3 => js_set_fill_color(80, 200, 120, 1.0)
    _ => js_set_fill_color(255, 50, 50, 1.0)
  }
  js_set_font(22, 1)
  js_draw_text(200 + sym_id, cx, cy)
}

///|
/// シンボルを暗く描画（上段・下段用）
fn draw_symbol_dim(sym_id : Int, cx : Double, cy : Double) -> Unit {
  match sym_id {
    0 => js_set_fill_color(150, 50, 50, 0.6)
    1 => js_set_fill_color(150, 130, 0, 0.6)
    2 => js_set_fill_color(120, 60, 150, 0.6)
    3 => js_set_fill_color(50, 120, 70, 0.6)
    _ => js_set_fill_color(150, 30, 30, 0.6)
  }
  js_set_font(20, 0)
  js_draw_text(200 + sym_id, cx, cy)
}

///|
/// 手札を描画
fn draw_hand(state : @game.GameState) -> Unit {
  let hand_size = state.hand.length()
  if hand_size == 0 {
    return
  }
  let total_w = hand_size.to_double() * card_w +
    (hand_size - 1).to_double() * card_gap
  let start_x = (canvas_w - total_w) / 2.0
  let start_y = 440.0
  // Choosing フェーズなら選択を促すメッセージ
  if state.phase == @game.Choosing {
    js_set_fill_color(255, 215, 0, 1.0)
    js_set_font(14, 1)
    js_draw_text(108, canvas_w / 2.0, start_y - 15.0)
  }
  for i, card in state.hand {
    let x = start_x + i.to_double() * (card_w + card_gap)
    let playable = state.phase == @game.Choosing
    draw_card(card, x, start_y, playable)
  }
}

///|
/// 単体カード描画
fn draw_card(card : @game.Card, x : Double, y : Double, playable : Bool) -> Unit {
  let card_id = @game.card_kind_to_id(card.kind)
  if playable {
    js_set_fill_color(40, 45, 70, 1.0)
  } else {
    js_set_fill_color(30, 30, 40, 0.6)
  }
  js_round_rect(x, y, card_w, card_h, 8.0)
  if playable {
    js_set_stroke_color(255, 215, 0, 1.0)
    js_set_line_width(2.0)
  } else {
    js_set_stroke_color(60, 60, 80, 0.6)
    js_set_line_width(1.0)
  }
  js_stroke_rect(x, y, card_w, card_h)
  if playable {
    js_set_fill_color(230, 230, 255, 1.0)
  } else {
    js_set_fill_color(120, 120, 140, 1.0)
  }
  js_set_font(10, 1)
  js_draw_text(card_id, x + card_w / 2.0, y + 35.0)
  if playable {
    js_set_fill_color(160, 170, 200, 1.0)
  } else {
    js_set_fill_color(90, 90, 110, 1.0)
  }
  js_set_font(8, 0)
  js_draw_text(card_id + 10, x + card_w / 2.0, y + 55.0)
  if card.base_damage > 0 {
    if playable {
      js_set_fill_color(255, 100, 100, 1.0)
    } else {
      js_set_fill_color(120, 60, 60, 1.0)
    }
    js_set_font(18, 1)
    js_draw_number(card.base_damage, x + card_w / 2.0, y + 90.0)
  }
}

///|
/// ログ表示
fn draw_log(state : @game.GameState) -> Unit {
  let lx = 620.0
  let ly = 40.0
  js_set_fill_color(25, 25, 40, 0.8)
  js_fill_rect(lx, ly, 170.0, 320.0)
  js_set_fill_color(180, 180, 200, 1.0)
  js_set_font(11, 1)
  js_draw_text(110, lx + 85.0, ly + 20.0)
  js_set_font(10, 0)
  let log_len = @game.log_count(state)
  let start = if log_len > 12 { log_len - 12 } else { 0 }
  for i in start..<log_len {
    let entry = @game.get_log(state, i)
    js_set_log(i, entry.card_id, entry.damage, entry.log_type)
    js_set_fill_color(150, 160, 190, 1.0)
    js_draw_log(i, lx + 10.0, ly + 40.0 + (i - start).to_double() * 22.0)
  }
}

///|
/// SPINボタン描画
fn draw_spin_button() -> Unit {
  let bx = 330.0
  let by = 320.0
  let bw = 140.0
  let bh = 45.0
  js_set_fill_color(60, 20, 120, 1.0)
  js_round_rect(bx, by, bw, bh, 10.0)
  js_set_stroke_color(180, 100, 255, 1.0)
  js_set_line_width(2.0)
  js_stroke_rect(bx, by, bw, bh)
  js_set_fill_color(255, 255, 255, 1.0)
  js_set_font(22, 1)
  js_draw_text(100, bx + bw / 2.0, by + bh / 2.0)
}

///|
/// 勝敗オーバーレイ
fn draw_phase_overlay(state : @game.GameState) -> Unit {
  match state.phase {
    @game.Playing => draw_spin_button()
    @game.Spinning => ()
    @game.Choosing => ()
    @game.Victory => {
      js_set_fill_color(0, 0, 0, 0.6)
      js_fill_rect(0.0, 0.0, canvas_w, canvas_h)
      js_set_fill_color(255, 215, 0, 1.0)
      js_set_font(48, 1)
      js_draw_text(102, canvas_w / 2.0, canvas_h / 2.0 - 20.0)
      js_set_fill_color(200, 200, 220, 1.0)
      js_set_font(16, 0)
      js_draw_text(104, canvas_w / 2.0, canvas_h / 2.0 + 30.0)
      js_set_fill_color(255, 180, 100, 1.0)
      js_set_font(14, 0)
      js_draw_text(106, canvas_w / 2.0, canvas_h / 2.0 + 60.0)
      js_draw_number(state.total_damage, canvas_w / 2.0 + 70.0, canvas_h / 2.0 + 60.0)
    }
    @game.Defeat => {
      js_set_fill_color(0, 0, 0, 0.6)
      js_fill_rect(0.0, 0.0, canvas_w, canvas_h)
      js_set_fill_color(180, 50, 50, 1.0)
      js_set_font(48, 1)
      js_draw_text(103, canvas_w / 2.0, canvas_h / 2.0 - 20.0)
      js_set_fill_color(200, 200, 220, 1.0)
      js_set_font(16, 0)
      js_draw_text(104, canvas_w / 2.0, canvas_h / 2.0 + 30.0)
      js_set_fill_color(255, 100, 100, 1.0)
      js_set_font(14, 0)
      js_draw_text(107, canvas_w / 2.0, canvas_h / 2.0 + 60.0)
      js_draw_number(state.enemy_hp, canvas_w / 2.0 + 50.0, canvas_h / 2.0 + 60.0)
    }
  }
}

///|
/// キャンバスサイズ取得
pub fn get_width() -> Int {
  canvas_w.to_int()
}

///|
pub fn get_height() -> Int {
  canvas_h.to_int()
}

///|
/// クリック座標からカードインデックスを判定
pub fn hit_test_card(state : @game.GameState, click_x : Double, click_y : Double) -> Int {
  let hand_size = state.hand.length()
  if hand_size == 0 {
    return -1
  }
  let total_w = hand_size.to_double() * card_w +
    (hand_size - 1).to_double() * card_gap
  let start_x = (canvas_w - total_w) / 2.0
  let start_y = 440.0
  for i in 0..<hand_size {
    let x = start_x + i.to_double() * (card_w + card_gap)
    if click_x >= x &&
      click_x <= x + card_w &&
      click_y >= start_y &&
      click_y <= start_y + card_h {
      return i
    }
  }
  -1
}

///|
/// SPINボタンのヒットテスト
pub fn hit_test_spin(click_x : Double, click_y : Double) -> Bool {
  click_x >= 330.0 && click_x <= 470.0 && click_y >= 320.0 && click_y <= 365.0
}

///|
/// リトライ判定（画面中央クリック）
pub fn hit_test_retry(click_x : Double, click_y : Double) -> Bool {
  click_x >= 200.0 && click_x <= 600.0 && click_y >= 200.0 && click_y <= 400.0
}
