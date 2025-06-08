const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

exports.handler = async (event) => {
  try {
    const { html, width = 1200, height = 630 } = JSON.parse(event.body || '{}');

    if (!html) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing "html" in request body' }),
      };
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: parseInt(width),
        height: parseInt(height),
      },
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const imageBuffer = await page.screenshot({ type: 'png' });

    await browser.close();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: `data:image/png;base64,${imageBuffer.toString('base64')}`,
      }),
    };
  } catch (err) {
    console.error('Rendering error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error rendering image.' }),
    };
  }
};
