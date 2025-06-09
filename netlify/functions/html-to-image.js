const express = require("express");
const serverless = require("serverless-http");
const { createCanvas, loadImage } = require("canvas");
const nodeHtmlToImage = require("node-html-to-image");

const app = express();
app.use(express.json({ limit: "5mb" }));

app.post("/html-to-image", async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: "Missing HTML in request body" });
  }

  try {
    // Create canvas with the required size (1350x1080)
    const canvas = createCanvas(1350, 1080);
    const ctx = canvas.getContext("2d");

    // Render the HTML to canvas
    await nodeHtmlToImage({
      html,
      type: "png",
      encoding: "buffer",
      puppeteer: null, // Disable puppeteer
      quality: 100,
      transparent: false,
      viewport: { width: 1350, height: 1080 },
      canvas: canvas,
      waitUntil: "networkidle0"
    });

    const imageBuffer = canvas.toBuffer("image/png");

    res.setHeader("Content-Type", "image/png");
    res.send(imageBuffer);
  } catch (err) {
    console.error("Error rendering image:", err);
    res.status(500).json({ error: "Failed to render image" });
  }
});

module.exports.handler = serverless(app);
