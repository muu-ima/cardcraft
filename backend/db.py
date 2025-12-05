import os
from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://card_user:card_pass@db:5432/card_db",
)

engine = create_engine(DATABASE_URL, echo=True)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
