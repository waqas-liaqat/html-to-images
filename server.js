const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const app = express();

app.use(bodyParser.text({ type: "*/*", limit: "1mb" }));

app.post("/render", async (req, res) => {
  try {
    const html = req.body;

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350 });
    await page.setContent(html, { waitUntil: "networkidle0" });

    const buffer = await page.screenshot({ type: "jpeg", quality: 90 });

    await browser.close();

    res.set("Content-Type", "image/jpeg");
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rendering failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HTML to Image running on port ${PORT}`));
