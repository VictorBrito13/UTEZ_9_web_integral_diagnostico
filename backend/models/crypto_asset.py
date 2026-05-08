from sqlalchemy import Column, Integer, String, Float

from database.database import Base

class CryptoAsset(Base):
    __tablename__ = "crypto_assets"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    symbol = Column(String(20), nullable=False)
    price = Column(Float)
    volume = Column(Float)
    market_cap = Column(Float)