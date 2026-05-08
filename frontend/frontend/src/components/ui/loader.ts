export function createLoader(): HTMLDivElement {
  const loader = document.createElement("div");
  loader.className = "loader hidden";
  loader.textContent = "Loading...";
  return loader;
}

export function setLoaderVisible(loader: HTMLElement, isVisible: boolean): void {
  loader.classList.toggle("hidden", !isVisible);
}
