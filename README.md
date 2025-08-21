# Sample Lambda Web Adapter Application

TypeScript + Express.jsで実装されたサンプルAPIアプリケーションです。AWS Lambda Web Adapterを使用してLambda + API Gatewayでホスティングすることを想定しています。

## 技術スタック

- **言語**: TypeScript (LTS)
- **フレームワーク**: Express.js (LTS)
- **実行環境**: Node.js 22
- **コンテナ**: Docker
- **デプロイ**: AWS Lambda + API Gateway
- **CI/CD**: GitHub Actions
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
├── .github/
│   └── workflows/
│       ├── deploy.yml    # 自動デプロイワークフロー
│       └── deploy-manual.yml # 手動デプロイワークフロー
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

1. GitHubリポジトリの設定
   - リポジトリのSecretsに`AWS_ROLE_ARN`を設定（GitHub Actions用のIAMロール）
   - AWSアカウントでOIDCプロバイダーとIAMロールを設定

2. AWSリソースの事前準備
   - ECRリポジトリの作成
   - Lambda関数の作成（初回のみ）

```bash
# ECRリポジトリの作成
aws ecr create-repository --repository-name sample-lambda-web-adapter --region ap-northeast-1

# Lambda関数の作成（初回のみ）
aws lambda create-function \
  --function-name sample-lambda-web-adapter \
  --role arn:aws:iam::[YOUR_ACCOUNT_ID]:role/lambda-execution-role \
  --code ImageUri=[YOUR_ACCOUNT_ID].dkr.ecr.ap-northeast-1.amazonaws.com/sample-lambda-web-adapter:latest \
  --package-type Image \
  --timeout 30 \
  --memory-size 512 \
  --region ap-northeast-1
```

### GitHub Actionsによる自動デプロイ

#### mainブランチへのプッシュ時の自動デプロイ

mainブランチにコードがプッシュされると、自動的にLambda関数がデプロイされます。

```yaml
# .github/workflows/deploy.yml
# mainブランチへのプッシュで自動実行
```

#### 手動デプロイ

GitHub Actionsのワークフローから手動でデプロイを実行できます。

1. GitHubリポジトリの「Actions」タブを開く
2. 「Manual Deploy Lambda Function」ワークフローを選択
3. 「Run workflow」をクリック
4. 環境（staging/production）を選択して実行

### ローカルからの手動デプロイ

```bash
# 1. ECRにログイン
aws ecr get-login-password --region ap-northeast-1 | \
  docker login --username AWS --password-stdin [YOUR_ACCOUNT_ID].dkr.ecr.ap-northeast-1.amazonaws.com

# 2. Dockerイメージのビルド
docker build -t sample-lambda-web-adapter .

# 3. ECRにタグ付け
docker tag sample-lambda-web-adapter:latest \
  [YOUR_ACCOUNT_ID].dkr.ecr.ap-northeast-1.amazonaws.com/sample-lambda-web-adapter:latest

# 4. ECRにプッシュ
docker push [YOUR_ACCOUNT_ID].dkr.ecr.ap-northeast-1.amazonaws.com/sample-lambda-web-adapter:latest

# 5. Lambda関数の更新
aws lambda update-function-code \
  --function-name sample-lambda-web-adapter \
  --image-uri [YOUR_ACCOUNT_ID].dkr.ecr.ap-northeast-1.amazonaws.com/sample-lambda-web-adapter:latest
```

### デプロイ後の確認

デプロイが完了すると、API GatewayのエンドポイントURLが出力されます。

```bash
# ヘルスチェック
curl https://[API_ID].execute-api.ap-northeast-1.amazonaws.com/health

# サンプルAPI
curl https://[API_ID].execute-api.ap-northeast-1.amazonaws.com/api/sample
```

## リソースの削除

```bash
# Lambda関数の削除
aws lambda delete-function --function-name sample-lambda-web-adapter

# ECRリポジトリの削除（イメージも含めて削除）
aws ecr delete-repository --repository-name sample-lambda-web-adapter --force
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
- [GitHub Actions aws-lambda-deploy](https://github.com/aws-actions/aws-lambda-deploy)
- [GitHub Actions Configure AWS Credentials](https://github.com/aws-actions/configure-aws-credentials)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)