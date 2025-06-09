import { ImageResponse } from '@vercel/og';
import { Resvg } from '@resvg/resvg-js';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { html } = JSON.parse(event.body || '{}');

  if (!html) {
    return { statusCode: 400, body: 'Missing HTML content' };
  }

  // Render SVG from HTML
  const svg = await new ImageResponse(html, {
    width: 1350,
    height: 1080,
  }).svg();

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: 1350,
    },
  });

  const pngBuffer = resvg.render().asPng();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png',
      'Access-Control-Allow-Origin': '*',
    },
    body: pngBuffer.toString('base64'),
    isBase64Encoded: true,
  };
};
