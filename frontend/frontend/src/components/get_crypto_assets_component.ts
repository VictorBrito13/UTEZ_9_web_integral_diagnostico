import { makeHttpRequest } from "../../utils/make_http_request";
import type {
  CryptoAssetSchema,
  ResponseSchema,
} from "../schemas/crypto_asset_schema";
import { createLoader, setLoaderVisible } from "./ui/loader";

export function createGetCryptoAssetsComponent(): HTMLElement {
  const section = document.createElement("section");
  section.className = "request-card";

  const title = document.createElement("h2");
  title.textContent = "GET /crypto_asset";

  const button = document.createElement("button");
  button.textContent = "Fetch assets";

  const loader = createLoader();
  const result = document.createElement("pre");
  result.className = "result";

  button.addEventListener("click", async () => {
    setLoaderVisible(loader, true);
    result.textContent = "";
    try {
      const response = await makeHttpRequest<ResponseSchema<CryptoAssetSchema[]>>(
        "GET",
        "/crypto_asset"
      );
      result.textContent = JSON.stringify(response, null, 2);
    } catch (error) {
      result.textContent = String(error);
    } finally {
      setLoaderVisible(loader, false);
    }
  });

  section.append(title, button, loader, result);
  return section;
}
