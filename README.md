# Jev Playground

日本語の文章と文脈を入力して、Jev の3種類の判断を比較するローカル Web アプリ。

- Noul：皮肉を含む確率
- Choice：発言の主な意図と選択肢ごとの確率
- Score：対応の緊急度（0〜2）
- サンプル4件、直近5件のセッション内履歴、API レスポンス表示

Node.js 22 以上が必要です。外部パッケージのインストールは不要です。

1. `.env` に `TYPESAFE_API_KEY=...` を設定します（Git 管理対象外）。
2. `npm start` を実行します。
3. http://localhost:4321 を開きます。ポートは `.env` の `PORT` で変更できます。

サンプルを選び「Jev に聞いてみる」を押してください。「さすがですね。」に文脈を
追加すると判断が変わるか試せます。実行ごとに外部の TypeSafe API に文章と文脈が
送信され、API 利用量が発生します。キーはサーバー側だけで読み込みます。
履歴はブラウザーのメモリーに保持し、リロードすると消えます。

`npm test` でローカル入力検証と非公開ファイルの保護を確認できます（API 呼び出しなし）。

公式資料：[Getting Started](https://docs.typesafe.ai/introduction/quickstart)、
[HTTP API](https://docs.typesafe.ai/api)。
