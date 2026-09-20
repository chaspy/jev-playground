# Jev Playground

Jev を使うローカルアプリの実験用リポジトリ。各アプリを `apps/<アプリ名>/` に分けます。

| アプリ | 内容 | 起動コマンド | URL |
| --- | --- | --- | --- |
| [utterance-playground](apps/utterance-playground/) | 発言の意図・皮肉を含む確率 | `npm run start:utterance` | http://localhost:4321 |

Node.js 22 以上が必要です。外部パッケージのインストールは不要です。
リポジトリルートの `.env` に `TYPESAFE_API_KEY=...` を設定し、ルートで起動コマンドを実行します。
`npm start` でも発言の実験アプリを起動できます。`npm test` で全アプリのテストを実行します。

アプリ固有のサーバー・画面・テスト・README・ログを各ディレクトリに配置します。
API キーはルートの `.env` を共用し、ログは各アプリの `logs/` に保存します。
どちらも Git 管理対象外です。既存ログは `apps/utterance-playground/logs/api.jsonl` に移動済みです。
新しいアプリを追加するときは別のポートと起動コマンドを割り当てます。
