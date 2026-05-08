import { makeHttpRequest } from "../../utils/make_http_request";
import type { ResponseSchema } from "../schemas/crypto_asset_schema";
import { createLoader, setLoaderVisible } from "./ui/loader";

export function createDeleteCryptoAssetComponent(): HTMLElement {
  const section = document.createElement("section");
  section.className = "request-card";

  const title = document.createElement("h2");
  title.textContent = "DELETE /crypto_asset/{id}";

  const input = document.createElement("input");
  input.type = "number";
  input.min = "1";
  input.value = "1";
  input.placeholder = "Crypto asset id";

  const button = document.createElement("button");
  button.textContent = "Delete asset";

  const loader = createLoader();
  const result = document.createElement("pre");
  result.className = "result";

  button.addEventListener("click", async () => {
    const cryptoAssetId = Number(input.value);
    if (!Number.isInteger(cryptoAssetId) || cryptoAssetId < 1) {
      result.textContent = "Please provide a valid id (>= 1).";
      return;
    }

    setLoaderVisible(loader, true);
    result.textContent = "";

    try {
      const response = await makeHttpRequest<ResponseSchema<null>>(
        "DELETE",
        `/crypto_asset/${cryptoAssetId}`
      );
      result.textContent = JSON.stringify(response, null, 2);
    } catch (error) {
      result.textContent = String(error);
    } finally {
      setLoaderVisible(loader, false);
    }
  });

  section.append(title, input, button, loader, result);
  return section;
}
