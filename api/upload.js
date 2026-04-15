export default async function handler(req, res) {
  try {
    const { file, name } = req.body;

    // 1. refresh token → access token
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

    // 2. dosya yükle
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

    res.status(200).json({ success: true, data });

  } catch (e) {
    res.status(500).json({ error: "upload failed" });
  }
}
