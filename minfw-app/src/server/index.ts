import express, { json } from 'express';
import path from 'path';
import cors from 'cors';
import { JSDOM } from 'jsdom';
import * as fs from 'fs';
/**
 * For now, relative imports must use ".js" due to this issue: 
 *  https://github.com/microsoft/TypeScript/issues/16577#issuecomment-703190339
 * Instead of adding complexity with another bundler, we'll simply use ".js" imports
 */
import { apiRouter } from './api/api.router.js';
import http from 'http';

const port = process.env.PORT || 8081;
const staticDir = path.resolve('dist/static');
const app = express();

app.use(cors());

app.use('/api', apiRouter);

// SSR Config
app.use(['/', '*'], async (req, res) => {
  const localServerFetch = async (reqPath, params: any = {}) => {
    try {
      new URL(reqPath);
      // If arg is a full URL, use default fetch
      return fetch(reqPath, params);
    } catch {
      // If partial URL, do local server request
      return new Promise((resolve, reject) => {
        let data = '';
        const request = http.request({
          host: 'localhost',
          port,
          path: reqPath,
          method: params.method || 'GET',
          headers: params.headers || {},
        }, (response) => {
          response.setEncoding('utf8');
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            resolve({
              json: () => Promise.resolve(JSON.parse(data)),
              text: () => Promise.resolve(data)
            });
          });
          response.on('error', (error) => {
            reject({error, data});
          });
        });
        request.end();
      });
    } 
  }

  const jsdom = await JSDOM.fromFile(`${staticDir}/index.html`, {
    runScripts: "dangerously",
    resources: 'usable',
    url: `http://localhost:${port}${req.originalUrl}`
  });
  jsdom.window.fetch = localServerFetch as any;
  const scripts = Array.from(jsdom.window.document.head.querySelectorAll('script'));
  for (const script of scripts) {
    const pathName = new URL(script.src).pathname;
    const staticPath = path.join(staticDir, pathName);
    if (fs.existsSync(staticPath)) {
      script.remove();
      const replacementScript = jsdom.window.document.createElement('script');
      replacementScript.textContent = fs.readFileSync(staticPath, { encoding: 'utf8' });
      jsdom.window.document.head.appendChild(replacementScript);
    }
  }

  jsdom.window.addEventListener('minfwRendered', () => {
    res.status(200).setHeader('Content-Type', 'text/html').send(jsdom.serialize());
  });
});

// Must be after SSR config
app.use(express.static(staticDir));

app.listen(port, () => {
  console.log(`Server app listening at http://localhost:${port}`);
});
