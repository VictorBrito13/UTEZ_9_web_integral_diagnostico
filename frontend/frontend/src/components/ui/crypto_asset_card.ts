import type { CryptoAssetSchema } from "../../schemas/crypto_asset_schema";

const VERB_CLASS: Record<string, string> = {
  GET: "verb-get",
  POST: "verb-post",
  PUT: "verb-put",
  DELETE: "verb-delete",
};

export type CardHandle = ReturnType<typeof createCryptoAssetCard>;

export function createCryptoAssetCard(verb: string, title: string) {
  const card = document.createElement("div");
  card.className = "glass-card crypto-card";

  const header = document.createElement("div");
  header.className = "card-header";

  const badge = document.createElement("span");
  badge.className = `verb-badge ${VERB_CLASS[verb] ?? ""}`;
  badge.textContent = verb;

  const h3 = document.createElement("h3");
  h3.className = "card-title";
  h3.textContent = title;

  header.append(badge, h3);
  card.append(header);

  const body = document.createElement("div");
  body.className = "card-body";
  card.append(body);

  const btn = document.createElement("button");
  btn.className = "btn-gradient card-btn";
  btn.type = "button";

  const btnText = document.createElement("span");
  btnText.className = "btn-text";

  const spinner = document.createElement("span");
  spinner.className = "btn-spinner hidden";
  spinner.innerHTML =
    '<svg class="spinner-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

  btn.append(btnText, spinner);
  card.append(btn);

  const respPanel = createResponsePanel(verb, title);
  card.append(respPanel.element);

  function addField(label: string, icon: string): HTMLInputElement {
    const input = document.createElement("input");
    input.type = "text";

    const group = document.createElement("div");
    group.className = "field-group";

    const lbl = document.createElement("label");
    lbl.className = "field-label";
    lbl.textContent = label;

    const wrapper = document.createElement("div");
    wrapper.className = "input-wrapper";

    const iconEl = document.createElement("span");
    iconEl.className = "input-icon";
    iconEl.textContent = icon;

    input.className = "field";
    input.placeholder = `Enter ${label.toLowerCase()}`;

    wrapper.append(iconEl, input);
    group.append(lbl, wrapper);
    body.append(group);

    return input;
  }

  function setButtonText(text: string) {
    btnText.textContent = text;
  }

  function setLoading(v: boolean) {
    btnText.classList.toggle("hidden", v);
    spinner.classList.toggle("hidden", !v);
    btn.disabled = v;
    respPanel.setLoading(v);
  }

  return {
    element: card,
    header,
    body,
    addField,
    button: btn,
    setButtonText,
    setLoading,
    responsePanel: respPanel,
  };
}

function createResponsePanel(verb: string, title: string) {
  const panel = document.createElement("div");
  panel.className = "response-panel";

  const header = document.createElement("div");
  header.className = "response-header";

  const statusBadge = document.createElement("span");
  statusBadge.className = "status-pill hidden";
  header.append(statusBadge);

  const timeEl = document.createElement("span");
  timeEl.className = "response-time hidden";
  header.append(timeEl);

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.title = "Copy response";
  copyBtn.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  header.append(copyBtn);
  panel.append(header);

  const skeleton = document.createElement("div");
  skeleton.className = "skeleton-loader hidden";
  for (let i = 0; i < 5; i++) {
    const line = document.createElement("div");
    line.className = "skeleton-line";
    line.style.width = `${55 + Math.random() * 35}%`;
    skeleton.append(line);
  }
  panel.append(skeleton);

  const output = document.createElement("div");
  output.className = "response-output";
  panel.append(output);

  let lastText = "";

  function setLoading(v: boolean) {
    skeleton.classList.toggle("hidden", !v);
    if (v) {
      output.innerHTML = "";
      statusBadge.classList.add("hidden");
      timeEl.classList.add("hidden");
    }
  }

  function emitLog(status: number, time: string) {
    panel.dispatchEvent(
      new CustomEvent("api-request", {
        bubbles: true,
        detail: { verb, title, status, time },
      })
    );
  }

  function showResponse(data: unknown, status?: number, time?: string) {
    setLoading(false);
    output.innerHTML = syntaxHighlight(data);

    lastText = output.textContent ?? "";

    if (status !== undefined) {
      statusBadge.classList.remove("hidden");
      statusBadge.className = `status-pill ${status >= 200 && status < 300 ? "status-ok" : "status-err"}`;
      statusBadge.textContent = String(status);
    } else {
      statusBadge.classList.add("hidden");
    }

    if (time) {
      timeEl.classList.remove("hidden");
      timeEl.textContent = time;
    } else {
      timeEl.classList.add("hidden");
    }

    emitLog(status ?? 200, time ?? "");
  }

  function showContent(el: HTMLElement, status?: number, time?: string) {
    setLoading(false);
    output.innerHTML = "";
    output.append(el);

    lastText = el.textContent ?? "";

    if (status !== undefined) {
      statusBadge.classList.remove("hidden");
      statusBadge.className = `status-pill ${status >= 200 && status < 300 ? "status-ok" : "status-err"}`;
      statusBadge.textContent = String(status);
    } else {
      statusBadge.classList.add("hidden");
    }

    if (time) {
      timeEl.classList.remove("hidden");
      timeEl.textContent = time;
    } else {
      timeEl.classList.add("hidden");
    }

    emitLog(status ?? 200, time ?? "");
  }

  function showError(msg: string, status?: number) {
    setLoading(false);
    const el = document.createElement("div");
    el.className = "response-error";
    el.textContent = msg;
    output.innerHTML = "";
    output.append(el);

    lastText = msg;

    statusBadge.classList.remove("hidden");
    statusBadge.className = `status-pill ${status !== undefined && status >= 200 && status < 300 ? "status-ok" : "status-err"}`;
    statusBadge.textContent = status !== undefined ? String(status) : "ERR";
    timeEl.classList.add("hidden");
    emitLog(status ?? 0, "");
  }

  function clear() {
    setLoading(false);
    output.innerHTML = "";
    statusBadge.classList.add("hidden");
    timeEl.classList.add("hidden");
  }

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(lastText).catch(() => {});
    copyBtn.classList.add("copied");
    setTimeout(() => copyBtn.classList.remove("copied"), 1500);
  });

  return {
    element: panel,
    setLoading,
    showResponse,
    showContent,
    showError,
    clear,
  };
}

export function renderSingleAsset(
  asset: CryptoAssetSchema,
  message?: string
): HTMLElement {
  const container = document.createElement("div");
  container.className = "asset-response";

  if (message) {
    const msg = document.createElement("div");
    msg.className = "response-message";
    msg.textContent = message;
    container.append(msg);
  }

  container.append(buildAssetCard(asset));
  return container;
}

export function renderAssetList(
  assets: CryptoAssetSchema[],
  message?: string
): HTMLElement {
  const container = document.createElement("div");
  container.className = "asset-response";

  if (message) {
    const msg = document.createElement("div");
    msg.className = "response-message";
    msg.textContent = message;
    container.append(msg);
  }

  if (assets.length === 0) {
    const empty = document.createElement("p");
    empty.className = "asset-empty";
    empty.textContent = "No assets found.";
    container.append(empty);
    return container;
  }

  const list = document.createElement("div");
  list.className = "asset-list";

  for (const asset of assets) {
    const item = buildAssetCard(asset);
    list.append(item);
  }

  container.append(list);
  return container;
}

export function renderSuccessMessage(
  msg: string,
  asset?: CryptoAssetSchema
): HTMLElement {
  const container = document.createElement("div");
  container.className = "asset-response";

  const messageEl = document.createElement("div");
  messageEl.className = "response-message success";
  messageEl.textContent = msg;
  container.append(messageEl);

  if (asset) {
    container.append(buildAssetCard(asset));
  }

  return container;
}

function buildAssetCard(asset: CryptoAssetSchema): HTMLElement {
  const card = document.createElement("div");
  card.className = "asset-card";

  const rows: [string, string, string][] = [];

  if (asset.id !== undefined) {
    rows.push(["ID", String(asset.id), "#\uFE0F\u20E3"]);
  }

  rows.push(
    ["Name", asset.name, "\uD83E\uDE99"],
    ["Symbol", asset.symbol, "\uD83D\uDD24"],
    [
      "Price",
      `$${Number(asset.price).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      "\uD83D\uDCB0",
    ],
    ["Volume", Number(asset.volume).toLocaleString(), "\uD83D\uDCCA"],
    [
      "Market Cap",
      `$${Number(asset.market_cap).toLocaleString()}`,
      "\uD83C\uDFDB\uFE0F",
    ],
  );

  for (const [label, value, icon] of rows) {
    const row = document.createElement("div");
    row.className = "asset-row";

    const labelEl = document.createElement("span");
    labelEl.className = "asset-label";
    labelEl.textContent = `${icon} ${label}`;

    const valueEl = document.createElement("span");
    valueEl.className = "asset-value";
    valueEl.textContent = value;

    row.append(labelEl, valueEl);
    card.append(row);
  }

  return card;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function syntaxHighlight(data: unknown): string {
  const json = JSON.stringify(data, null, 2);
  if (!json) return "";

  const pre = document.createElement("pre");
  pre.className = "json-block";

  let result = "";
  let i = 0;

  while (i < json.length) {
    if (json[i] === '"') {
      const start = i;
      i++;
      while (i < json.length) {
        if (json[i] === "\\" && i + 1 < json.length) i += 2;
        else if (json[i] === '"') {
          i++;
          break;
        } else i++;
      }
      const str = json.slice(start, i);
      let j = i;
      while (j < json.length && json[j] === " ") j++;
      const isKey = json[j] === ":";
      const cls = isKey ? "json-key" : "json-string";
      result += `<span class="${cls}">${escapeHtml(str)}</span>`;
    } else if (
      (json[i] >= "0" && json[i] <= "9") ||
      json[i] === "-"
    ) {
      const start = i;
      i++;
      while (i < json.length && /[\d.eE+\-]/i.test(json[i])) i++;
      result += `<span class="json-number">${escapeHtml(json.slice(start, i))}</span>`;
    } else if (json.startsWith("true", i)) {
      result += '<span class="json-number">true</span>';
      i += 4;
    } else if (json.startsWith("false", i)) {
      result += '<span class="json-number">false</span>';
      i += 5;
    } else if (json.startsWith("null", i)) {
      result += '<span class="json-number">null</span>';
      i += 4;
    } else if ("{}[],:".includes(json[i])) {
      result += `<span class="json-punct">${escapeHtml(json[i])}</span>`;
      i++;
    } else {
      result += escapeHtml(json[i]);
      i++;
    }
  }

  pre.innerHTML = result;
  return pre.outerHTML;
}
