import { makeHttpRequest } from "../../utils/make_http_request";
import type {
  CryptoAssetSchema,
  ResponseSchema,
} from "../schemas/crypto_asset_schema";
import { createCryptoAssetCard, renderAssetList } from "./ui/crypto_asset_card";

export function createGetCryptoAssetsComponent(): HTMLElement {
  const card = createCryptoAssetCard("GET", "Fetch Assets");

  card.setButtonText("Fetch assets");

  card.button.addEventListener("click", async () => {
    card.setLoading(true);
    const start = performance.now();
    try {
      const response = await makeHttpRequest<
        ResponseSchema<CryptoAssetSchema[]>
      >("GET", "/crypto_asset");
      const elapsed = ((performance.now() - start) / 1000).toFixed(2) + "s";
      const content = renderAssetList(response.data, response.message);
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
