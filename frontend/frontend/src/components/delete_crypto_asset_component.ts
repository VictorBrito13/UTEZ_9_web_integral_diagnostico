import { makeHttpRequest } from "../../utils/make_http_request";
import type { ResponseSchema } from "../schemas/crypto_asset_schema";
import { createCryptoAssetCard } from "./ui/crypto_asset_card";

export function createDeleteCryptoAssetComponent(): HTMLElement {
  const card = createCryptoAssetCard("DELETE", "Delete Asset");

  const idInput = card.addField("ID", "#\uFE0F\u20E3");
  idInput.type = "number";
  idInput.min = "1";
  idInput.value = "1";

  card.setButtonText("Delete asset");

  card.button.addEventListener("click", async () => {
    const cryptoAssetId = Number(idInput.value);
    if (!Number.isInteger(cryptoAssetId) || cryptoAssetId < 1) {
      card.responsePanel.showError("Please provide a valid id (>= 1).", 400);
      return;
    }

    card.setLoading(true);
    const start = performance.now();
    try {
      const response = await makeHttpRequest<ResponseSchema<null>>(
        "DELETE",
        `/crypto_asset/${cryptoAssetId}`
      );
      const elapsed = ((performance.now() - start) / 1000).toFixed(2) + "s";
      card.responsePanel.showResponse(response, 200, elapsed);
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
