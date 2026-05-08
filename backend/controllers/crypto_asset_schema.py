from pydantic import BaseModel

class CryptoAssetSchema(BaseModel):
    name: str
    symbol: str
    price: float
    volume: float
    market_cap: float