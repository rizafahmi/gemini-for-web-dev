import fs from 'fs';
import http from 'http';

(async () => {
  const server = http.createServer(async (request, response) => {
    const { url } = request;
    if (url === '/health') {
      response.writeHead(200).end('OK');
    } else if (url === '/' || url === '/index.html') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(fs.readFileSync('./index.html'));
    } else if (url.startsWith('/chat')) {
      const parsedUrl = new URL(`http://localhost/${url}`);
      const { search } = parsedUrl;
      const question = decodeURIComponent(search.substring(1));
      console.log(question);
    } else {
      console.error(`${url} is 404!`);
      response.writeHead(404);
      response.end();
    }
  });

  const port = process.env.PORT || 5000;
  console.log('SERVER:');
  console.log(' port:', port);
  server.listen(port);
})();