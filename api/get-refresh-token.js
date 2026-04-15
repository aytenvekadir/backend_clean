export default async function handler(req, res) {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: "code yok" });
    }

    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        code: code,
        grant_type: "authorization_code",
        client_id: process.env.APP_KEY,
        client_secret: process.env.APP_SECRET
      })
    });

    const data = await response.json();

    res.status(200).json(data);

  } catch (e) {
    res.status(500).json({ error: "server error" });
  }
}
