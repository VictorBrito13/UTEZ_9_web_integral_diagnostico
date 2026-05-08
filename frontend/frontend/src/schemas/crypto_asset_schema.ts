export interface CryptoAssetSchema {
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
