from datetime import datetime
from sqlmodel import SQLModel, Field


class Card(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    x: int
    y: int
    template: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
