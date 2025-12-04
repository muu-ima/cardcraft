# 🎴 Cardcraft

Next.js + FastAPI + Docker で動く **名刺デザイン用のミニ Web エディタ** です。  
PNG テンプレート画像の上にテキストを重ねて、ブラウザ上でレイアウト調整し、そのまま画像としてダウンロードできます。

> 「まずはローカル Docker だけで動く、個人向けの名刺エディタサービス」を目指したプロジェクト。

---

## ✨ 今できること（MVP）

- 名刺テンプレート画像（1600×800）を読み込み
- 名前テキストを入力（最大 9 文字）
- テキストをドラッグで好きな位置に配置
- キャンバスは 2:1 の名刺比率（800×400）で表示
- キャンバスをそのまま PNG としてダウンロード（ブラウザ側で生成）

今はフロントエンド中心の **初期テスト版** ですが、  
今後 FastAPI バックエンドと連携して、デザインの保存・復元・高解像度出力などを追加予定です。

---

## 🛠 技術スタック

### Frontend

- **Next.js 14 (App Router)**
- **TypeScript**
- **React Konva**（キャンバス描画）
- **Tailwind CSS**
- Node.js 20.x

`frontend/` ディレクトリ配下に配置。

### Backend

- **FastAPI**
- **Uvicorn**
- （今はシンプルな `GET /` のみ実装）

`backend/` ディレクトリ配下に配置。

### Dev / Infra

- **Docker / Docker Compose**
- WSL2 (Ubuntu) 上で開発

---

## 📁 ディレクトリ構成（ざっくり）

```text
cardcraft/
  backend/              # FastAPI アプリ
    main.py             # FastAPI エントリポイント
    requirements.txt    # Python 依存パッケージ
    Dockerfile          # backend 用 Dockerfile

  frontend/             # Next.js アプリ
    app/
      editor/page.tsx   # 名刺エディタのメインページ
      ...
    public/
      cocco-bg-11.png   # テンプレート画像
    package.json
    Dockerfile          # frontend 用 Dockerfile

  docker-compose.yml    # front + back をまとめて起動する Compose 設定

🚀 起動方法

前提：Docker / Docker Compose がインストール済み

cd cardcraft
docker compose up --build

起動後：

フロントエンド: http://localhost:3000

/editor にアクセスすると名刺エディタ画面

バックエンド: http://localhost:8000

GET / で {"message": "FastAPI running!"} が返る動作確認用

止めるときは Ctrl + C で停止、必要なら

docker compose down

🧑‍💻 開発モードで動かす（Docker なし）
Frontend（Next.js）
cd frontend
npm install
npm run dev


http://localhost:3000
 で起動

app/editor/page.tsx を編集するとエディタ画面が更新されます

Backend（FastAPI）
cd backend
python -m venv venv
source venv/bin/activate  # Windows の場合: venv\Scripts\activate
pip install -r requirements.txt

uvicorn main:app --reload --host 0.0.0.0 --port 8000

http://localhost:8000
 で API 起動

🧱 機能メモ / 今後の TODO

 Docker で Next.js + FastAPI の最小構成

 PNG テンプレート上でテキストをドラッグ移動

 名刺キャンバスを PNG ダウンロード