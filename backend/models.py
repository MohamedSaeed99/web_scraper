from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class TrackedItem(Base):
    __tablename__ = "tracked_items"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, nullable=False)
    item_name = Column(String, nullable=True)
    price = Column(Float, nullable=True)
    buy_link = Column(String, nullable=True)
    threshold = Column(Float, nullable=True)
    notify_email = Column(String, nullable=True)
    last_checked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
