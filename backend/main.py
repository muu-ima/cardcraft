from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from db import init_db, get_session
from models import Card


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CardSnapshot(BaseModel):
    name: str
    x: int
    y: int
    template: str


class CardRead(BaseModel):
    id: int
    name: str
    x: int
    y: int
    template: str

    class Config:
        from_attributes = True  # SQLModel → Pydantic 変換用


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {"message": "FastAPI + PostgreSQL + SQLModel ready"}


# ---- CREATE（保存） ----
@app.post("/snapshot", response_model=CardRead)
def save_snapshot(
    snapshot: CardSnapshot,
    session: Session = Depends(get_session),
):
    card = Card(**snapshot.dict())
    session.add(card)
    session.commit()
    session.refresh(card)
    return card


# ---- READ（一覧） ----
@app.get("/cards", response_model=list[CardRead])
def list_cards(session: Session = Depends(get_session)):
    cards = session.exec(select(Card).order_by(Card.id.desc())).all()
    return cards
