# Jev Playground

日本語の文章を入力して、Jev の2種類の判断を比較するローカル Web アプリ。

- Noul：皮肉を含む確率
- Choice：発言の主な意図と選択肢ごとの確率
- サンプル4件、直近5件のセッション内履歴、実際の API request（質問・判定基準を含む）と response の JSON 表示

Node.js 22 以上が必要です。外部パッケージのインストールは不要です。

1. リポジトリルートの `.env` に `TYPESAFE_API_KEY=...` を設定します（Git 管理対象外）。
2. リポジトリルートで `npm run start:utterance` を実行します。
3. http://localhost:4321 を開きます。ポートは `.env` の `PORT` で変更できます。

サンプルを選び「Jev に聞いてみる」を押してください。言い回しを
変えると判断が変わるか試せます。実行ごとに外部の TypeSafe API に文章が
送信され、API 利用量が発生します。キーはサーバー側だけで読み込みます。
履歴はブラウザーのメモリーに保持し、リロードすると消えます。

API 呼び出しは `apps/utterance-playground/logs/api.jsonl` に1実行1行の JSON として追記します。
日時・実行 ID・request（文章と質問）・response・HTTP ステータス・所要時間を記録し、
通信失敗時もエラー種別を残します。API キーと認証ヘッダーは記録しません。
ログは Git 管理対象外で、ブラウザーから取得できません。Codex はこのファイルを読んで
過去の結果を確認できます。不要になったログは削除できます。導入前の実行は記録されません。

`npm test` でローカル入力検証と非公開ファイルの保護を確認できます（API 呼び出しなし）。

公式資料：[Getting Started](https://docs.typesafe.ai/introduction/quickstart)、
[HTTP API](https://docs.typesafe.ai/api)。

応答時間はサーバーから TypeSafe API への往復時間と、ブラウザーからの全体所要時間を表示します。
推定コストは [公式料金](https://docs.typesafe.ai/models)（2026-09-20 確認）に基づき、
`jev-1.13.0` の入力 tokens × $0.042 / 100万で計算します。出力は無料です。
未知のモデルや使用量がない場合は不明と表示します。推定額は実際の請求額とは異なる場合があります。
API 応答時間と推定コストはローカルログにも残ります。
