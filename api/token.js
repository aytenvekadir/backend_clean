import fetch from "node-fetch";

export default async function handler(req, res) {

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
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

    const data = await response.json();

    res.status(200).json({
      access_token: data.access_token
    });

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
