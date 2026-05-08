from fastapi import APIRouter
from fastapi import Request
from typing import List, Dict
from models.crypto_asset import CryptoAsset
from controllers.crypto_asset_schema import CryptoAssetSchema
from controllers.response_schema import ResponseSchema

router = APIRouter(prefix="/crypto_asset")

@router.get("", response_model=ResponseSchema[List[CryptoAssetSchema]])
def get_all(request: Request):
    session = request.app.state.my_sql_session
    data = [CryptoAssetSchema(**crypto_asset.__dict__) for crypto_asset in session.query(CryptoAsset).all()]
    response = ResponseSchema(message="Crypto assets fetched successfully", data=data)
    return response

@router.post("", response_model=ResponseSchema[CryptoAssetSchema])
def create(request: Request, crypto_asset: CryptoAssetSchema):
    session = request.app.state.my_sql_session
    crypto_asset = CryptoAsset(**crypto_asset.model_dump())
    session.add(crypto_asset)
    session.commit()
    response = ResponseSchema(message="Crypto asset created successfully", data=CryptoAssetSchema(**crypto_asset.__dict__))
    return response

@router.put("/{crypto_asset_id}", response_model=ResponseSchema[CryptoAssetSchema])
def update(request: Request, crypto_asset_id: int, crypto_asset: CryptoAssetSchema):
    session = request.app.state.my_sql_session
    crypto_asset = CryptoAsset(**crypto_asset.model_dump())
    session.query(CryptoAsset).filter(CryptoAsset.id == crypto_asset_id).update(crypto_asset.__dict__)
    session.commit()
    response = ResponseSchema(message="Crypto asset updated successfully", data=CryptoAssetSchema(**crypto_asset.__dict__))
    return response

@router.delete("/{crypto_asset_id}", response_model=ResponseSchema[None])
def delete(request: Request, crypto_asset_id: int):
    session = request.app.state.my_sql_session
    session.query(CryptoAsset).filter(CryptoAsset.id == crypto_asset_id).delete()
    session.commit()
    response = ResponseSchema(message="Crypto asset deleted successfully", data=None)
    return response