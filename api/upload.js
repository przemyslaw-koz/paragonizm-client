export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await req.json();
    const url = process.env.N8N_JSON_WEBHOOK;
    if (!url) {
      return new Response("Missing N8N_JSON_WEBHOOK", { status: 500 });
    }

    const forward = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await forward.text();
    return new Response(text, {
      status: forward.status,
      headers: {
        "content-type": forward.headers.get("content-type") || "text/plain",
      },
    });
  }

  if (
    contentType.includes("multipart/form-data") ||
    contentType.includes("application/x-www-form-urlencoded")
  ) {
    const form = await req.formData();
    const file = form.get("file");

    const url = process.env.N8N_WEBHOOK_URL;
    if (!url) {
      return new Response("Missing N8N_WEBHOOK_URL", { status: 500 });
    }

    const out = new FormData();
    out.append("file", file, file.name || "photo.jpg");

    const forward = await fetch(url, {
      method: "POST",
      body: out,
    });

    const text = await forward.text();
    return new Response(text, {
      status: forward.status,
      headers: {
        "content-type": forward.headers.get("content-type") || "text/plain",
      },
    });
  }

  return new Response("Unsupported Content-Type", { status: 400 });
}
