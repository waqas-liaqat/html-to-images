// netlify/functions/htmlToImage.js
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

exports.handler = async (event, context) => {
  try {
    // Only accept POST
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }

    // Parse HTML input from JSON body
    let body = event.body || '';
    if (event.isBase64Encoded) {
      body = Buffer.from(body, 'base64').toString();
    }
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (err) {
      return { statusCode: 400, body: 'Invalid JSON' };
    }
    const html = payload.html;
    if (!html) {
      return { statusCode: 400, body: 'Missing html field' };
    }

    // Launch headless Chrome using chrome-aws-lambda
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1350, height: 1080 },
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    // Set the HTML content. Using waitUntil to ensure rendering is complete.
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Optional: add delay if needed for fonts/scripts: await page.waitForTimeout(500);

    // Take a screenshot. Use PNG for lossless quality.
    const imageBuffer = await page.screenshot({ type: 'png' });
    await browser.close();

    // Return image as base64 (Netlify requires base64 for binary content)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'image/png' },
      body: imageBuffer.toString('base64'),
      isBase64Encoded: true,    // Important for binary response
    };
  } catch (err) {
    // On error, return 500
    return { statusCode: 500, body: 'Error: ' + err.message };
  }
};
