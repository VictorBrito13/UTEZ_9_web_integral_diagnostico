from fastapi import APIRouter
from fastapi import HTTPException
from fastapi import Request
from typing import List, Dict
from models.crypto_asset import CryptoAsset
from controllers.crypto_asset_schema import CryptoAssetCreateSchema, CryptoAssetSchema
from controllers.response_schema import ResponseSchema

router = APIRouter(prefix="/crypto_asset")


def _to_schema(asset: CryptoAsset) -> CryptoAssetSchema:
    return CryptoAssetSchema(
        id=asset.id,
        name=asset.name,
        symbol=asset.symbol,
        price=asset.price,
        volume=asset.volume,
        market_cap=asset.market_cap,
    )

@router.get("", response_model=ResponseSchema[List[CryptoAssetSchema]])
def get_all(request: Request):
    session = request.app.state.my_sql_session
    data = [_to_schema(crypto_asset) for crypto_asset in session.query(CryptoAsset).all()]
    response = ResponseSchema(message="Crypto assets fetched successfully", data=data)
    return response

@router.post("", response_model=ResponseSchema[CryptoAssetSchema])
def create(request: Request, crypto_asset: CryptoAssetCreateSchema):
    session = request.app.state.my_sql_session
    db_crypto_asset = CryptoAsset(**crypto_asset.model_dump())
    session.add(db_crypto_asset)
    session.commit()
    session.refresh(db_crypto_asset)
    response = ResponseSchema(
        message="Crypto asset created successfully",
        data=_to_schema(db_crypto_asset),
    )
    return response

@router.put("/{crypto_asset_id}", response_model=ResponseSchema[CryptoAssetSchema])
def update(request: Request, crypto_asset_id: int, crypto_asset: CryptoAssetCreateSchema):
    session = request.app.state.my_sql_session
    db_crypto_asset = session.query(CryptoAsset).filter(CryptoAsset.id == crypto_asset_id).first()
    if not db_crypto_asset:
        raise HTTPException(status_code=404, detail="Crypto asset not found")

    payload = crypto_asset.model_dump()
    for key, value in payload.items():
        setattr(db_crypto_asset, key, value)

    session.commit()
    session.refresh(db_crypto_asset)
    response = ResponseSchema(
        message="Crypto asset updated successfully",
        data=_to_schema(db_crypto_asset),
    )
    return response

@router.delete("/{crypto_asset_id}", response_model=ResponseSchema[Dict[str, bool]])
def delete(request: Request, crypto_asset_id: int):
    session = request.app.state.my_sql_session
    deleted_rows = session.query(CryptoAsset).filter(CryptoAsset.id == crypto_asset_id).delete()
    session.commit()
    was_deleted = deleted_rows > 0
    message = "Crypto asset deleted successfully" if was_deleted else "Crypto asset not found"
    response = ResponseSchema(message=message, data={"deleted": was_deleted})
    return response