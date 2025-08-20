# Sample Lambda Web Adapter Application

TypeScript + Express.jsで実装されたサンプルAPIアプリケーションです。AWS Lambda Web Adapterを使用してLambda + API Gatewayでホスティングすることを想定しています。

## 技術スタック

- **言語**: TypeScript (LTS)
- **フレームワーク**: Express.js (LTS)
- **実行環境**: Node.js 22
- **コンテナ**: Docker
- **デプロイ**: AWS Lambda + API Gateway
- **IaC**: AWS SAM
- **コンテナアダプター**: AWS Lambda Web Adapter

## プロジェクト構成

```
.
├── src/
│   └── index.ts          # Express.jsアプリケーション
├── dist/                 # TypeScriptビルド出力（gitignore）
├── Dockerfile            # Lambda用Dockerfile（Lambda Web Adapter対応）
├── Dockerfile.dev        # 開発環境用Dockerfile
├── docker-compose.yml    # 開発環境用Docker Compose設定
├── template.yaml         # AWS SAMテンプレート
├── samconfig.toml        # SAMデプロイ設定
├── tsconfig.json         # TypeScript設定
├── package.json          # Node.js依存関係
└── README.md            # このファイル
```

## API エンドポイント

### GET /health
ヘルスチェック用エンドポイント

**レスポンス例:**
```json
{
  "status": "healthy"
}
```

### GET /api/sample
固定JSONレスポンスを返すサンプルエンドポイント

**レスポンス例:**
```json
{
  "message": "This is a sample API response",
  "timestamp": "2025-08-20T12:00:00.000Z",
  "data": {
    "id": 1,
    "name": "Sample Item",
    "description": "This is a fixed JSON response from the API",
    "attributes": {
      "type": "demo",
      "version": "1.0.0"
    }
  }
}
```

## 開発環境のセットアップ

### 前提条件

- Docker と Docker Compose がインストールされていること
- Node.js 22 以上（ローカル開発の場合）
- AWS CLI と SAM CLI（デプロイする場合）

### ローカル開発（Node.js）

1. 依存関係のインストール
```bash
npm install
```

2. 開発サーバーの起動
```bash
npm run dev
```

3. ビルド
```bash
npm run build
```

4. プロダクションモードで起動
```bash
npm start
```

### Docker環境での開発

1. Dockerコンテナの起動
```bash
docker compose up
```

2. コンテナの停止
```bash
docker compose down
```

開発サーバーはhttp://localhost:8080でアクセスできます。ソースコードの変更は自動的に反映されます。

## Lambda Web Adapterについて

AWS Lambda Web Adapterは、既存のHTTPサーバーアプリケーションをLambdaで実行するためのアダプターです。

### 主な特徴

- Express.jsなどの標準的なWebフレームワークをそのままLambdaで実行可能
- コード変更不要でLambda対応
- ローカル開発と同じコードベースを使用
- API GatewayのHTTP APIイベントを自動的にHTTPリクエストに変換

### 動作原理

1. Lambda Web AdapterはLambda Extensionとして動作
2. Lambda実行時に、アダプターがアプリケーションのHTTPサーバー（ポート8080）を起動
3. API Gatewayからのリクエストをローカルホストのポート8080に転送
4. アプリケーションのレスポンスをLambdaレスポンス形式に変換して返却

## AWSへのデプロイ

### 前提条件

1. AWS CLIの設定
```bash
aws configure
```

2. SAM CLIのインストール
```bash
# macOS
brew install aws-sam-cli

# その他のOS
# https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
```

3. ECRリポジトリの作成
```bash
aws ecr create-repository --repository-name sample-lambda-web-adapter --region ap-northeast-1
```

### デプロイ手順

1. ECRにログイン
```bash
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin [YOUR_ACCOUNT_ID].dkr.ecr.ap-northeast-1.amazonaws.com
```

2. samconfig.tomlのECRリポジトリURIを更新
```toml
image_repositories = ["SampleApiFunction=[YOUR_ACCOUNT_ID].dkr.ecr.ap-northeast-1.amazonaws.com/sample-lambda-web-adapter"]
```

3. SAMビルド
```bash
sam build
```

4. SAMデプロイ（初回）
```bash
sam deploy --guided
```

5. 2回目以降のデプロイ
```bash
sam deploy
```

### デプロイ後の確認

デプロイが完了すると、API GatewayのエンドポイントURLが出力されます。

```bash
# ヘルスチェック
curl https://[API_ID].execute-api.ap-northeast-1.amazonaws.com/health

# サンプルAPI
curl https://[API_ID].execute-api.ap-northeast-1.amazonaws.com/api/sample
```

## スタックの削除

```bash
sam delete
```

## トラブルシューティング

### Docker composeが起動しない場合

- Dockerデーモンが起動しているか確認
- ポート8080が他のプロセスで使用されていないか確認

### Lambdaが正常に動作しない場合

- CloudWatch Logsでエラーログを確認
- Lambda関数のメモリサイズやタイムアウト値を調整（template.yaml）

### ECRへのpushが失敗する場合

- ECRログインコマンドを再実行
- IAMロールにECRへのアクセス権限があるか確認

## リソース

- [AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)