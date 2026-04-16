import Busboy from "busboy";
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
    const busboy = Busboy({ headers: req.headers });

    let fileBuffer = [];
    let fileName = "";
    let name = "misafir";
    let type = "images";

    busboy.on("file", (fieldname, file, info) => {
      fileName = info.filename;

      file.on("data", (data) => {
        fileBuffer.push(data);
      });
    });

    busboy.on("field", (fieldname, val) => {
      if (fieldname === "name") name = val || "misafir";
      if (fieldname === "type") type = val || "images";
    });

    busboy.on("finish", async () => {
      const buffer = Buffer.concat(fileBuffer);

      const path = `/${type}/${name}/${Date.now()}-${fileName}`;

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
    });

    req.pipe(busboy);

  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
