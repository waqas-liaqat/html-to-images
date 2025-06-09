const express = require("express");
const serverless = require("serverless-http");
const nodeHtmlToImage = require("node-html-to-image");

const app = express();
app.use(express.json({ limit: "5mb" }));

app.post("/html-to-image", async (req, res) => {
  const { html } = req.body;
  if (!html) {
    return res.status(400).json({ error: "Missing HTML" });
  }

  try {
    const image = await nodeHtmlToImage({
      html,
      type: "png",
      quality: 100,
      transparent: false,
      encoding: "buffer",
      puppeteerArgs: {
        args: ['--no-sandbox'],
      },
      waitUntil: 'networkidle0',
    });

    res.setHeader("Content-Type", "image/png");
    res.send(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image rendering failed" });
  }
});

module.exports.handler = serverless(app);
