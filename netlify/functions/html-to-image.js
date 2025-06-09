import chromium from 'chrome-aws-lambda';
import { Buffer } from 'buffer';
import { builder } from '@netlify/functions';

const handler = async (event) => {
  try {
    const { html } = JSON.parse(event.body || '{}');
    if (!html) {
      return {
        statusCode: 400,
        body: 'Missing HTML',
      };
    }

    const browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: {
        width: 1350,
        height: 1080,
      },
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const buffer = await page.screenshot({ type: 'png' });

    await browser.close();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/png',
        'Access-Control-Allow-Origin': '*',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Error: ${err.message}`,
    };
  }
};

export const handler = builder(handler);
