export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const form = await req.formData();
  const file = form.get("file");

  const url = file ? process.env.N8N_WEBHOOK_URL : process.env.N8N_JSON_WEBHOOK;

  if (!url) {
    return new Response("Missing N8N_WEBHOOK_URL", { status: 500 });
  }

  if (file) {
    const out = new FormData();
    out.append("file", file, "photo.jpg");

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
  } else {
    const data = Object.fromEntries(form.entries());

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
}
