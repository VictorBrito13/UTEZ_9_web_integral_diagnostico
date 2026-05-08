import "./style.css";
import { createCreateCryptoAssetComponent } from "./components/create_crypto_asset_component";
import { createDeleteCryptoAssetComponent } from "./components/delete_crypto_asset_component";
import { createGetCryptoAssetsComponent } from "./components/get_crypto_assets_component";
import { createUpdateCryptoAssetComponent } from "./components/update_crypto_asset_component";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Missing #app root element");
}

const title = document.createElement("h1");
title.textContent = "Crypto Assets API Client";

const description = document.createElement("p");
description.textContent =
  "Each card calls one endpoint from the backend crypto asset router.";

const grid = document.createElement("main");
grid.className = "grid";
grid.append(
  createGetCryptoAssetsComponent(),
  createCreateCryptoAssetComponent(),
  createUpdateCryptoAssetComponent(),
  createDeleteCryptoAssetComponent()
);

app.replaceChildren(title, description, grid);
