export default async function handler(req, res) {

  // 🔥 CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  try {
    const { file, name } = req.body;

    const tokenRes = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: process.env.REFRESH_TOKEN,
        client_id: process.env.APP_KEY,
        client_secret: process.env.APP_SECRET
      })
    });

    
    const tokenData = await tokenRes.json();
    const access_token = tokenData.access_token;

    const uploadRes = await fetch("https://content.dropboxapi.com/2/files/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${access_token}`,
        "Dropbox-API-Arg": JSON.stringify({
          path: `/${name || "misafir"}/${Date.now()}.jpg`,
          mode: "add",
          autorename: true
        }),
        "Content-Type": "application/octet-stream"
      },
      body: Buffer.from(file, "base64")
    });

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      return res.status(500).json(data);
    }

    res.status(200).json({ success: true });

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
