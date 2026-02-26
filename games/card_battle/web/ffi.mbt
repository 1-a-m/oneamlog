///|
/// Canvas描画FFI - JSから提供される関数
extern "wasm" fn js_clear_rect(x : Double, y : Double, w : Double, h : Double) = "canvas" "clearRect"

///|
extern "wasm" fn js_fill_rect(x : Double, y : Double, w : Double, h : Double) = "canvas" "fillRect"

///|
extern "wasm" fn js_stroke_rect(x : Double, y : Double, w : Double, h : Double) = "canvas" "strokeRect"

///|
extern "wasm" fn js_round_rect(x : Double, y : Double, w : Double, h : Double, r : Double) = "canvas" "roundRect"

///|
extern "wasm" fn js_set_fill_color(r : Int, g : Int, b : Int, a : Double) = "canvas" "setFillColor"

///|
extern "wasm" fn js_set_stroke_color(r : Int, g : Int, b : Int, a : Double) = "canvas" "setStrokeColor"

///|
extern "wasm" fn js_set_line_width(w : Double) = "canvas" "setLineWidth"

///|
extern "wasm" fn js_set_font(size : Int, bold : Int) = "canvas" "setFont"

///|
/// テキスト描画（card_id + text_typeでJSが適切なテキストを描画）
extern "wasm" fn js_draw_text(text_id : Int, x : Double, y : Double) = "canvas" "drawText"

///|
/// 数値テキスト描画
extern "wasm" fn js_draw_number(num : Int, x : Double, y : Double) = "canvas" "drawNumber"

///|
/// ログテキスト描画（ログインデックス指定）
extern "wasm" fn js_draw_log(log_index : Int, x : Double, y : Double) = "canvas" "drawLog"

///|
/// ログをJSに登録
extern "wasm" fn js_set_log(index : Int, card_id : Int, damage : Int, log_type : Int) = "canvas" "setLog"

///|
/// パーティクル発生をJSに通知
extern "wasm" fn js_emit_particles(x : Double, y : Double, card_id : Int) = "canvas" "emitParticles"

///|
/// リールアニメーション開始（左・中・右のシンボルIDを渡す）
extern "wasm" fn js_start_reel_animation(s1 : Int, s2 : Int, s3 : Int) = "canvas" "startReelAnimation"

///|
/// 現在時刻（ミリ秒）を取得
extern "wasm" fn js_now() -> Double = "env" "now"
