const express = require("express");
const serverless = require("serverless-http");
const chrome = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const nodeHtmlToImage = require("node-html-to-image");

const app = express();
app.use(express.json({ limit: "5mb" }));

app.post("/html-to-image", async (req, res) => {
  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: "Missing HTML in request body" });
  }

  try {
    const browser = await puppeteer.launch({
      args: chrome.args,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
    });

    const image = await nodeHtmlToImage({
      html,
      type: "png",
      encoding: "buffer",
      quality: 100,
      transparent: false,
      puppeteer: browser,
      viewport: {
        width: 1350,
        height: 1080
      },
      waitUntil: "networkidle0"
    });

    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(image);
  } catch (err) {
    console.error("Error rendering image:", err);
    res.status(500).json({ error: "Failed to render image" });
  }
});

module.exports.handler = serverless(app);
