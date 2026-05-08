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

  const pre = document.createElement("pre");
  pre.className = "json-block hidden";
  panel.append(pre);

  let lastJson = "";

  function setLoading(v: boolean) {
    skeleton.classList.toggle("hidden", !v);
    if (v) {
      pre.classList.add("hidden");
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
    pre.classList.remove("hidden");
    pre.innerHTML = syntaxHighlight(data);
    pre.style.animation = "none";
    void pre.offsetWidth;
    pre.style.animation = "fadeSlideIn 0.35s ease";

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

    lastJson = pre.textContent ?? "";
    emitLog(status ?? 200, time ?? "");
  }

  function showError(msg: string, status?: number) {
    setLoading(false);
    pre.classList.remove("hidden");
    pre.textContent = msg;
    pre.style.animation = "none";
    void pre.offsetWidth;
    pre.style.animation = "fadeSlideIn 0.35s ease";
    statusBadge.classList.remove("hidden");
    statusBadge.className = `status-pill ${status !== undefined && status >= 200 && status < 300 ? "status-ok" : "status-err"}`;
    statusBadge.textContent = status !== undefined ? String(status) : "ERR";
    timeEl.classList.add("hidden");
    lastJson = msg;
    emitLog(status ?? 0, "");
  }

  function clear() {
    setLoading(false);
    pre.classList.add("hidden");
    statusBadge.classList.add("hidden");
    timeEl.classList.add("hidden");
  }

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(lastJson).catch(() => {});
    copyBtn.classList.add("copied");
    setTimeout(() => copyBtn.classList.remove("copied"), 1500);
  });

  return { element: panel, setLoading, showResponse, showError, clear };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function syntaxHighlight(data: unknown): string {
  const json = JSON.stringify(data, null, 2);
  if (!json) return "";

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
    } else if ((json[i] >= "0" && json[i] <= "9") || json[i] === "-") {
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

  return result;
}
