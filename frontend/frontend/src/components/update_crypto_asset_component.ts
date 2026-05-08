import { makeHttpRequest } from "../../utils/make_http_request";
import type {
  CryptoAssetSchema,
  ResponseSchema,
} from "../schemas/crypto_asset_schema";
import {
  createCryptoAssetCard,
  renderSingleAsset,
} from "./ui/crypto_asset_card";

export function createUpdateCryptoAssetComponent(): HTMLElement {
  const card = createCryptoAssetCard("PUT", "Update Asset");

  const idInput = card.addField("ID", "#\uFE0F\u20E3");
  idInput.type = "number";
  idInput.min = "1";
  idInput.value = "1";

  const nameInput = card.addField("Name", "\uD83E\uDE99");
  nameInput.value = "Ethereum";

  const symbolInput = card.addField("Symbol", "\uD83D\uDD24");
  symbolInput.value = "ETH";

  const priceInput = card.addField("Price", "\uD83D\uDCB0");
  priceInput.type = "number";
  priceInput.value = "3200";

  const volumeInput = card.addField("Volume", "\uD83D\uDCCA");
  volumeInput.type = "number";
  volumeInput.value = "900000000";

  const marketCapInput = card.addField("Market Cap", "\uD83C\uDFDB\uFE0F");
  marketCapInput.type = "number";
  marketCapInput.value = "390000000000";

  card.setButtonText("Update asset");

  card.button.addEventListener("click", async () => {
    const cryptoAssetId = Number(idInput.value);
    if (!Number.isInteger(cryptoAssetId) || cryptoAssetId < 1) {
      card.responsePanel.showError("Please provide a valid id (>= 1).", 400);
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
      card.responsePanel.showError(
        "Please complete all fields with valid values before updating.",
        400
      );
      return;
    }

    card.setLoading(true);
    const start = performance.now();
    try {
      const response = await makeHttpRequest<
        ResponseSchema<CryptoAssetSchema>,
        CryptoAssetSchema
      >("PUT", `/crypto_asset/${cryptoAssetId}`, payload);
      const elapsed = ((performance.now() - start) / 1000).toFixed(2) + "s";
      const content = renderSingleAsset(response.data, response.message);
      card.responsePanel.showContent(content, 200, elapsed);
    } catch (error) {
      const msg = String(error);
      const m = msg.match(/\((\d+)\)/);
      card.responsePanel.showError(msg, m ? parseInt(m[1]) : undefined);
    } finally {
      card.setLoading(false);
    }
  });

  return card.element;
}
