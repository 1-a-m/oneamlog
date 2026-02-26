///|
/// スロットシンボル
pub(all) enum Symbol {
  Cherry    // チェリー: 4ダメージ (ハズレ)
  Bell      // ベル: 8ダメージ
  Bar       // BAR: 15ダメージ
  Replay    // リプレイ: 山札から1枚引く
  Seven     // 7: 手札のカードを1枚選んで発動
} derive(Show, Eq)

///|
/// スロット結果（各リールの停止位置）
pub(all) struct SlotResult {
  left_pos : Int      // 左リール停止位置 (0-19)
  center_pos : Int    // 中リール停止位置 (0-19)
  right_pos : Int     // 右リール停止位置 (0-19)
} derive(Show)

///|
/// カードの種類
pub(all) enum CardKind {
  Strike
  HeavyStrike
  Fireball
  QuickStrike
  PowerUp
  Rage
  Critical
  Drain
  Combo
  Shield_Bash
} derive(Show, Eq)

///|
/// カード情報
pub(all) struct Card {
  kind : CardKind
  name : String
  description : String
  base_damage : Int
} derive(Show)

///|
/// ゲームの状態
pub(all) enum Phase {
  Playing     // SPINボタン待ち
  Spinning    // リール回転中（アニメーション）
  Choosing    // Seven出目: 手札からカード選択中
  Victory
  Defeat
} derive(Show, Eq)

///|
/// バフ情報
pub(all) struct Buffs {
  mut damage_multiplier : Int
  mut flat_damage_bonus : Int
} derive(Show)

///|
pub fn Buffs::new() -> Buffs {
  { damage_multiplier: 1, flat_damage_bonus: 0 }
}

///|
/// ログエントリ
pub(all) struct LogEntry {
  card_id : Int
  damage : Int
  log_type : Int   // 0:攻撃, 1:バフ, 2:ドロー, 3:スロット結果
} derive(Show)

///|
/// ゲーム状態
pub(all) struct GameState {
  mut spins_left : Int
  mut enemy_hp : Int
  mut enemy_max_hp : Int
  hand : Array[Card]
  deck : Array[Card]
  mut cards_played : Int
  buffs : Buffs
  mut phase : Phase
  mut total_damage : Int
  logs : Array[LogEntry]
  mut slot_result : SlotResult
} derive(Show)
