///|
fn main {
  // WASM: JSからstart_game()を呼び出して初期化する
}

///|
/// ゲーム状態（グローバル）
let game_state : Ref[@game.GameState] = {
  val: @game.new_game(1),
}

///|
/// 現在の難易度
let difficulty : Ref[Int] = { val: 1 }

///|
/// WASM初期化（JSから呼ばれる）
pub fn start_game() -> Unit {
  let seed = js_now().to_int().land(0x7fffffff).reinterpret_as_uint()
  @game.seed_rng(seed)
  game_state.val = @game.new_game(difficulty.val)
  sync_logs()
  draw_all(game_state.val)
}

///|
/// クリックイベント（JSから呼ばれる）
pub fn on_click(x : Double, y : Double) -> Unit {
  let state = game_state.val
  match state.phase {
    @game.Playing => {
      // SPINボタンクリック判定
      if hit_test_spin(x, y) {
        let spun = @game.start_spin(state)
        if spun {
          // Spinningフェーズに遷移済み、停止位置をJSに渡してアニメ開始
          draw_all(state)
          js_start_reel_animation(
            state.slot_result.left_pos,
            state.slot_result.center_pos,
            state.slot_result.right_pos,
          )
        }
      }
    }
    @game.Spinning => () // アニメーション中はクリック無視
    @game.Choosing => {
      // カードクリック判定（Seven出目で手札選択中）
      let card_index = hit_test_card(state, x, y)
      if card_index >= 0 {
        let card_id = @game.card_kind_to_id(state.hand[card_index].kind)
        let played = @game.play_card(state, card_index)
        if played {
          js_emit_particles(x, y, card_id + 10)
          sync_logs()
          draw_all(state)
        }
      }
    }
    _ => {
      // 勝敗画面でクリック → リトライ
      if hit_test_retry(x, y) {
        if state.phase == @game.Victory {
          difficulty.val += 1
        }
        let seed = js_now().to_int().land(0x7fffffff).reinterpret_as_uint()
        @game.seed_rng(seed)
        game_state.val = @game.new_game(difficulty.val)
        sync_logs()
        draw_all(game_state.val)
      }
    }
  }
}

///|
/// リールアニメーション完了時にJSから呼ばれる
pub fn on_reel_stopped() -> Unit {
  let state = game_state.val
  // パーティクル発生（中央リールのシンボル位置）
  let (_, center_sym, _) = @game.get_center_symbols(state.slot_result)
  let sym_id = @game.symbol_to_id(center_sym)
  js_emit_particles(400.0, 215.0, sym_id)
  // スロット結果を解決
  @game.resolve_current_spin(state)
  sync_logs()
  draw_all(state)
}

///|
/// キャンバスサイズ取得（JSから呼ばれる）
pub fn get_canvas_width() -> Int {
  get_width()
}

///|
pub fn get_canvas_height() -> Int {
  get_height()
}

///|
/// ログをJS側に同期
fn sync_logs() -> Unit {
  let state = game_state.val
  let count = @game.log_count(state)
  for i in 0..<count {
    let entry = @game.get_log(state, i)
    js_set_log(i, entry.card_id, entry.damage, entry.log_type)
  }
}
