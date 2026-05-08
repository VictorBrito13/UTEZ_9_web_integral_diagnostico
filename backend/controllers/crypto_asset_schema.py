from pydantic import BaseModel


class CryptoAssetBaseSchema(BaseModel):
    name: str
    symbol: str
    price: float
    volume: float
    market_cap: float


class CryptoAssetCreateSchema(CryptoAssetBaseSchema):
    pass


class CryptoAssetSchema(CryptoAssetBaseSchema):
    id: int