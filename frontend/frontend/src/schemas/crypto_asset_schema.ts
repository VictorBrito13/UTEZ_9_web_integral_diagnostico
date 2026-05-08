export interface CryptoAssetSchema {
  id?: number;
  name: string;
  symbol: string;
  price: number;
  volume: number;
  market_cap: number;
}

export interface ResponseSchema<T> {
  message: string;
  data: T;
}
