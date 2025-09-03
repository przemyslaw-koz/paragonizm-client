export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
  if (!N8N_WEBHOOK_URL) {
    return new Response('Missing N8N_WEBHOOK_URL', { status: 500 });
  }

  // Odczytaj form-data z klienta
  const form = await req.formData();
  const file = form.get('file');
  if (!file) return new Response('No file field', { status: 400 });

  // Zbuduj nowe form-data i przekaż do n8n (zachowując nazwę pliku)
  const out = new FormData();
  out.append('file', file, file.name || 'photo.jpg');

  const forward = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    body: out,
  });

  // Przekaż odpowiedź z n8n 1:1 (status + body)
  const text = await forward.text();
  return new Response(text, {
    status: forward.status,
    headers: { 'content-type': forward.headers.get('content-type') || 'text/plain' }
  });
}
