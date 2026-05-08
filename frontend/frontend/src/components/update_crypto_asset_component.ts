import { makeHttpRequest } from "../../utils/make_http_request";
import type {
  CryptoAssetSchema,
  ResponseSchema,
} from "../schemas/crypto_asset_schema";
import { createLoader, setLoaderVisible } from "./ui/loader";

export function createUpdateCryptoAssetComponent(): HTMLElement {
  const section = document.createElement("section");
  section.className = "request-card";

  const title = document.createElement("h2");
  title.textContent = "PUT /crypto_asset/{id}";

  const idInput = document.createElement("input");
  idInput.type = "number";
  idInput.min = "1";
  idInput.value = "1";
  idInput.placeholder = "Crypto asset id";

  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.placeholder = "name";
  nameInput.value = "Ethereum";

  const symbolInput = document.createElement("input");
  symbolInput.type = "text";
  symbolInput.placeholder = "symbol";
  symbolInput.value = "ETH";

  const priceInput = document.createElement("input");
  priceInput.type = "number";
  priceInput.placeholder = "price";
  priceInput.value = "3200";

  const volumeInput = document.createElement("input");
  volumeInput.type = "number";
  volumeInput.placeholder = "volume";
  volumeInput.value = "900000000";

  const marketCapInput = document.createElement("input");
  marketCapInput.type = "number";
  marketCapInput.placeholder = "market_cap";
  marketCapInput.value = "390000000000";

  const button = document.createElement("button");
  button.textContent = "Update asset";

  const loader = createLoader();
  const result = document.createElement("pre");
  result.className = "result";

  button.addEventListener("click", async () => {
    const cryptoAssetId = Number(idInput.value);
    if (!Number.isInteger(cryptoAssetId) || cryptoAssetId < 1) {
      result.textContent = "Please provide a valid id (>= 1).";
      return;
    }

    const payload: CryptoAssetSchema = {
      name: nameInput.value.trim(),
      symbol: symbolInput.value.trim(),
      price: Number(priceInput.value),
      volume: Number(volumeInput.value),
      market_cap: Number(marketCapInput.value),
    };

    if (
      !payload.name ||
      !payload.symbol ||
      Number.isNaN(payload.price) ||
      Number.isNaN(payload.volume) ||
      Number.isNaN(payload.market_cap)
    ) {
      result.textContent =
        "Please complete all fields with valid values before updating.";
      return;
    }

    setLoaderVisible(loader, true);
    result.textContent = "";

    try {
      const response = await makeHttpRequest<
        ResponseSchema<CryptoAssetSchema>,
        CryptoAssetSchema
      >("PUT", `/crypto_asset/${cryptoAssetId}`, payload);
      result.textContent = JSON.stringify(response, null, 2);
    } catch (error) {
      result.textContent = String(error);
    } finally {
      setLoaderVisible(loader, false);
    }
  });

  section.append(
    title,
    idInput,
    nameInput,
    symbolInput,
    priceInput,
    volumeInput,
    marketCapInput,
    button,
    loader,
    result
  );
  return section;
}
