Cardcraft — 名刺スナップショットエディタ

Next.js（フロントエンド） + FastAPI（バックエンド） + Docker の
名刺デザイン編集・保存・一覧管理ツール です。

PNG テンプレート画像の上にテキストを配置し、
スナップショットとして保存 → 一覧 → 編集 → 削除まで行えます。

目標は「ローカルでもクラウドでも動く、軽量で拡張しやすい名刺デザインエディタ」。

✨ 現在できること（MVP 完成）
🖋 名刺エディタ /editor?id={id}

名前テキストの入力

テキスト位置（x, y）の調整

テンプレート画像の表示（1600×800）

即時プレビュー

PNG としてローカルへダウンロード

「更新する」ボタンで FastAPI の
PUT /cards/{id} を叩き DB 更新

🗂 スナップショット一覧 /cards

FastAPI の DB に保存されたデザイン一覧。

ID / 名前 / テンプレート名 / 位置（x, y）

「編集」→ エディタへ遷移

「削除」 → DELETE /cards/{id}

「新しい名刺を作る」→ 新規スナップショット作成（POST /snapshot）

🛠 技術スタック
Frontend（Next.js）

Next.js 14 (App Router)

TypeScript

React Hooks（useCards カスタムフック）

Tailwind CSS

Node.js 20.x
→ frontend/ に配置

Backend（FastAPI）

FastAPI + SQLModel

PostgreSQL

Uvicorn

CRUD 完備：

POST /snapshot

GET /cards

GET /cards/{id}

PUT /cards/{id}

DELETE /cards/{id}

→ backend/ に配置

Infra / Dev

Docker / Docker Compose

WSL2 (Ubuntu)

ローカル開発 & Docker 両対応

📁 ディレクトリ構成（最新版）
cardcraft/
  backend/
    db.py                # DB 初期化 / Session
    models.py            # SQLModel (Card)
    main.py              # FastAPI エンドポイント
    requirements.txt
    Dockerfile

  frontend/
    app/
      editor/page.tsx    # 名刺エディタ
      cards/page.tsx     # スナップショット一覧
      layout.tsx
      globals.css
    hooks/
      useCards.ts        # CRUD カスタムフック
    public/
      templates/...       # 背景テンプレート画像
    .env.local
    Dockerfile

  docker-compose.yml      # front + back + db をまとめて起動

🚀 起動方法（Docker）
前提

Docker / Docker Compose がインストール済み

cd cardcraft
docker compose up --build

起動後
役割	URL
フロントエンド	http://localhost:3000

名刺エディタ	http://localhost:3000/editor?id=3

スナップショット一覧	http://localhost:3000/cards

バックエンド	http://localhost:8000

DB	PostgreSQL (compose 内で起動)

停止：

docker compose down

🧑‍💻 開発モード（Docker なし）
フロント（Next.js）
cd frontend
npm install
npm run dev


http://localhost:3000

（ページ編集は即反映）

バックエンド（FastAPI）
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000


http://localhost:8000
 で起動

🔧 API 仕様（FastAPI）
メソッド	エンドポイント	役割
POST	/snapshot	新規スナップショットを保存
GET	/cards	全件一覧
GET	/cards/{id}	単体取得
PUT	/cards/{id}	更新
DELETE	/cards/{id}	削除

スキーマ：

CardBase（name, x, y, template）

CardCreate

CardUpdate

CardRead（id 付き）

🪝 useCards フック（フロントの要）

Next.js 側の CRUD ロジックを 1 つにまとめたカスタムフック。

const {
  cards,
  loading,
  error,
  createCard,
  updateCard,
  deleteCard,
  refetch
} = useCards();
