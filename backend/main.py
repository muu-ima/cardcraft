from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from db import init_db, get_session
from models import Card

# =======================================
# FastAPI アプリ本体
# =======================================
app = FastAPI()

# CORS（Next.js から叩けるようにする）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =======================================
# Pydantic スキーマ（用途ごとに分割）
# =======================================
class CardBase(BaseModel): 
    name: str
    x: int
    y: int
    template: str

class CardCreate(CardBase):
    """POST /snapshot 用"""
    pass

class CardUpdate(CardBase):
    """UPDATE 用 (PUT /cards/{id})"""
    pass

class CardRead(CardBase):
    """READ 用 (レスポンス用。 id を含む)"""
    id: int

    class Config:
        from_attributes = True # SQLModel → Pydantic 変換用

# =======================================
# 起動時に DB 初期化
# =======================================
@app.on_event("startup")
def on_startup():
    init_db()

# =======================================
# ヘルスチェック
# =======================================
@app.get("/")
def root():
    return {"message": "FastAPI + PostgreSQL + SQLModel ready"}


# =======================================
# CREATE（新規保存）: /snapshot
# =======================================
@app.post("/snapshot", response_model=CardRead)
def save_snapshot(
    snapshot: CardCreate,
    session: Session = Depends(get_session),
):
    """
    名刺のスナップショットを新規作成。
    フロントの Editor から呼んでいるエンドポイント。
    """
    card = Card(**snapshot.dict())
    session.add(card)
    session.commit()
    session.refresh(card)
    return card


# =======================================
# READ（一覧）: /cards
# =======================================
@app.get("/cards", response_model=list[CardRead])
def list_cards(session: Session = Depends(get_session)):
    """
    作成済みカードを新しい順に一覧取得。
    """
    cards = session.exec(select(Card).order_by(Card.id.desc())).all()
    return cards

# =======================================
# READ（1件）: /cards/{card_id}
# =======================================
@app.get("/cards/{card_id}", response_model=CardRead)
def get_card(
    card_id: int,
    session: Session = Depends(get_session),
):
    """
    単一のカードを ID で取得。
    /cards/[id]/page.tsx から使う。
    """
    card = session.get(Card, card_id)
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card


# =======================================
# UPDATE（更新）: /cards/{card_id}
# =======================================
@app.put("/cards/{card_id}", response_model=CardRead)
def update_card(
    card_id: int, 
    card: CardUpdate, 
    session: Session = Depends(get_session),
):
    """
    既存カードを上書き更新。
    将来的に Editor から「保存」ボタンで叩く想定。
    """
    db_card = session.get(Card, card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # フィールドを一括で上書き
    for key, value in card.dict().items():
        setattr(card, key, value)

    session.add(db_card)
    session.commit()
    session.refresh(db_card)
    return db_card

# =======================================
# DELETE: /cards/{card_id}
# =======================================
@app.delete("/cards/{card_id}", status_code=204)
def delete_card(
    card_id: int,
    session: Session = Depends(get_session),
):
    db_card = session.get(Card, card_id)
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")

    session.delete(db_card)
    session.commit()
    # 204 No Content なので return は不要