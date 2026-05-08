import "./style.css";
import { createGetCryptoAssetsComponent } from "./components/get_crypto_assets_component";
import { createCreateCryptoAssetComponent } from "./components/create_crypto_asset_component";
import { createUpdateCryptoAssetComponent } from "./components/update_crypto_asset_component";
import { createDeleteCryptoAssetComponent } from "./components/delete_crypto_asset_component";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("Missing #app root element");

const topBar = document.createElement("header");
topBar.className = "top-bar";

const topInner = document.createElement("div");
topInner.className = "top-bar-inner";

const h1 = document.createElement("h1");
h1.className = "h1-gradient";
h1.textContent = "Crypto Assets API Client";

const apiInfo = document.createElement("div");
apiInfo.className = "api-info";

const apiUrl = document.createElement("span");
apiUrl.className = "api-url";
apiUrl.textContent = `API: ${import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000"}`;

const health = document.createElement("span");
health.className = "health-indicator";
const dot = document.createElement("span");
dot.className = "pulse-dot";
health.append(dot, "Online");

apiInfo.append(apiUrl, health);
topInner.append(h1, apiInfo);
topBar.append(topInner);

const description = document.createElement("p");
description.className = "app-description";
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

const recentSection = document.createElement("section");
recentSection.className = "recent-requests";
const recentTitle = document.createElement("h3");
recentTitle.textContent = "Recent Requests";
const log = document.createElement("ul");
log.className = "request-log";
recentSection.append(recentTitle, log);

app.append(topBar, description, grid, recentSection);

app.addEventListener("api-request", ((e: CustomEvent) => {
  const { verb, title: name, status, time } = e.detail;
  const li = document.createElement("li");
  li.textContent = `${verb} ${name} \u2014 ${status}${time ? ` (${time})` : ""}`;
  log.prepend(li);
  while (log.children.length > 20) {
    log.lastElementChild?.remove();
  }
}) as EventListener);
