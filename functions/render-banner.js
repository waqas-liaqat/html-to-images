const chromium = require("chrome-aws-lambda");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Only POST method is supported",
    };
  }

  let browser = null;

  try {
    const { html, width = 800, height = 600 } = JSON.parse(event.body || "{}");

    if (!html) {
      return {
        statusCode: 400,
        body: "Missing HTML content",
      };
    }

    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      defaultViewport: { width: parseInt(width), height: parseInt(height) },
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const screenshot = await page.screenshot({ type: "png", encoding: "base64" });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: `data:image/png;base64,${screenshot}`,
      }),
    };
  } catch (error) {
    console.error("Rendering error:", error);
    return {
      statusCode: 500,
      body: "Error rendering image.",
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
};
