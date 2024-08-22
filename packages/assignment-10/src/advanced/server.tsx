// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import express from 'express';
import ReactDOMServer from 'react-dom/server';
import { App } from './App.tsx';

const app = express();
const port = 3333;

const cache = new Map();

app.get('*', (req, res) => {
  const cacheKey = req.url;

  if (cache.get(cacheKey)) {
    console.log('Cache Hit for', cacheKey);
    res.send(cache.get(cacheKey));
    return;
  }

  const app = ReactDOMServer.renderToString(<App url={req.url} />);

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple SSR</title>
    </head>
    <body>
      <div id="root">${app}</div>
    </body>
    </html>
  `;

  cache.set(cacheKey, html);
  res.send(html);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
