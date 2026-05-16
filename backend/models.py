from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
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
    notified = Column(Boolean, default=False, nullable=False)
    last_checked = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
