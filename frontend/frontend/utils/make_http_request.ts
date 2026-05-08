export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export async function makeHttpRequest<TResponse, TBody = unknown>(
  method: HttpMethod,
  path: string,
  body?: TBody
): Promise<TResponse> {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  if (!backendUrl) {
    throw new Error("VITE_BACKEND_URL is not defined");
  }

  const url = `${backendUrl}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as TResponse;
}
