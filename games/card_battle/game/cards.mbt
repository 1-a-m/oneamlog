///|
/// カード定義を取得
pub fn card_data(kind : CardKind) -> Card {
  match kind {
    Strike => { kind, name: "ストライク", description: "6ダメージ", base_damage: 6 }
    HeavyStrike => { kind, name: "ヘビーストライク", description: "12ダメージ", base_damage: 12 }
    Fireball => { kind, name: "ファイアボール", description: "20ダメージ", base_damage: 20 }
    QuickStrike => { kind, name: "クイックストライク", description: "3ダメージ", base_damage: 3 }
    PowerUp => { kind, name: "パワーアップ", description: "次の攻撃2倍", base_damage: 0 }
    Rage => { kind, name: "レイジ", description: "全攻撃+5", base_damage: 0 }
    Critical => { kind, name: "クリティカル", description: "次の攻撃3倍", base_damage: 0 }
    Drain => { kind, name: "ドレイン", description: "8ダメージ+1枚引く", base_damage: 8 }
    Combo => { kind, name: "コンボ", description: "3×使用枚数", base_damage: 0 }
    Shield_Bash => { kind, name: "シールドバッシュ", description: "4ダメージ", base_damage: 4 }
  }
}

///|
/// 全カード種類のデッキプール
pub fn all_card_kinds() -> Array[CardKind] {
  [
    Strike, Strike, Strike,
    HeavyStrike, HeavyStrike,
    Fireball,
    QuickStrike, QuickStrike, QuickStrike,
    PowerUp, PowerUp,
    Rage,
    Critical,
    Drain, Drain,
    Combo, Combo,
    Shield_Bash, Shield_Bash,
  ]
}
