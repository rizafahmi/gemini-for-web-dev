import fs from 'fs';
import http from 'http';

async function compare(opt1, opt2) {
  const prompt = `Please choose your answer given by user delimited by triple dash below and give short reason why. You will answer in Bahasa Indonesia.

      Example:
      User: Mending laptop atau rakit pc?
      Asisten: Mending merakit PC, karena:
      
      * Lebih hemat biaya
      * Lebih fleksibel dalam memilih komponen
      * Dapat di-upgrade dengan mudah
      * Lebih cocok untuk kebutuhan spesifik
      
      User: Mending liburan ke laut atau ke gunung?
      Asisten: Mending liburan ke laut, karena:
      
      * Cuaca lebih hangat
      * Pemandangan yang lebih indah
      * Banyak aktivitas air yang menyenangkan
      * Cocok untuk bersantai dan berjemur
      
      
      ---
      
      User: Mending belajar ${opt1} atau ${opt2}?`;
  
  // Generate suggestion
  
}

(async () => {
  const server = http.createServer(async (request, response) => {
    const { url } = request;
    if (url === '/health') {
      response.writeHead(200).end('OK');
    } else if (url === '/' || url === '/index.html') {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(fs.readFileSync('./public/index.html'));
    } else if (url.startsWith('/compare')) {
      const parsedUrl = new URL(`http://localhost/${url}`);
      const { search } = parsedUrl;
      const options = decodeURIComponent(search.substring(1)).split('&');
      const suggestion = await compare(options[0].split('=')[1], options[1].split('=')[1]);
      console.log(suggestion);
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