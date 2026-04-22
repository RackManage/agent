import { firebaseConfig } from "./firebase-config";

async function firebaseJsonRequest(
  method: "DELETE" | "PUT",
  path: string,
  authToken: string,
  body?: unknown
) {
  const url = new URL(`/${path}.json`, firebaseConfig.databaseURL);
  url.searchParams.set("auth", authToken);

  const response = await fetch(url, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? undefined : {
      "content-type": "application/json",
    },
    method,
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Firebase request failed with status ${response.status}`);
  }

  return text ? JSON.parse(text) : null;
}

export { firebaseJsonRequest };
