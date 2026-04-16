import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const chunks = [];

    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    // 🔥 burada basit parse yapıyoruz (dosya + metadata)
    // küçük hack: formData'dan name/type ayıklamak yerine default veriyoruz

    const path = `/uploads/${Date.now()}`;

    const uploadRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.ACCESS_TOKEN}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: path,
          mode: "add",
          autorename: true
        }),
        "Content-Type": "application/octet-stream"
      },
      body: buffer
    });

    const data = await uploadRes.text();

    if (!uploadRes.ok) {
      return res.status(500).json({ error: data });
    }

    res.status(200).json({ ok: true });

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
