import fs from 'fs';
import http from 'http';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { parse } from 'marked';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DB_URL;

const client = createClient({
  url,
  authToken: process.env.TURSO_TOKEN
});
// initdb();

async function compare(topic, opt1, opt2) {
  // Generate suggestion
  const MODEL_NAME = 'gemini-1.0-pro';
  const { API_KEY } = process.env;
  if (!API_KEY) {
    console.error('Please provide the API_KEY..');
    return;
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({model: MODEL_NAME});
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const parts = [
    {text: `Please choose your answer given by user delimited by triple dash below and give short reason why. You will answer in Bahasa Indonesia.\n\nExample:\nUser: Mending laptop atau rakit pc?\nAsisten: Mending merakit PC, karena:\n\n* Lebih hemat biaya\n* Lebih fleksibel dalam memilih komponen\n* Dapat di-upgrade dengan mudah\n* Lebih cocok untuk kebutuhan spesifik\n\n\n\n---\n\nUser: ${topic} mending belajar ${opt1} atau ${opt2}?`},
  ];

  const result = await model.generateContent({
    contents: [{role: 'user', parts}],
    generationConfig,
    safetySettings
  });

  const { response } = result;
  return response.text();
}

// async function initdb() {
//   const sql = `CREATE TABLE IF NOT EXISTS topics (
//     ID INTEGER PRIMARY KEY AUTOINCREMENT,
//     topic VARCHAR(100),
//     option1 VARCHAR(100),
//     option2 VARCHAR(100),
//     result TEXT
//     , upvote INTEGER DEFAULT 0, downvote INTEGER DEFAULT 0);`;

//   client.execute({sql});

// }

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
      const topic = options[0].split('=')[1];
      const opt1 = options[1].split('=')[1];
      const opt2 = options[2].split('=')[1];
      const suggestion = await compare(topic, opt1, opt2);
      console.log(suggestion);
      client.execute({
        sql: 'INSERT INTO topics (topic, option1, option2, result) VALUES (?, ?, ?, ?)',
        args: [topic, opt1, opt2, suggestion]
      });
      
      response.writeHead(200).end(parse(suggestion));
    } else if(url === '/results') {
      const { rows } = await client.execute('SELECT * FROM topics ORDER BY (upvote + downvote) DESC, id DESC');
      const topics = rows.map(row => {
        return {
          id: row.ID,
          topic: row.topic,
          option1: row.option1,
          option2: row.option2,
          upvote: row.upvote,
          downvote: row.downvote,
          result: parse(row.result)
        };
      });
      response.writeHead(200).end(JSON.stringify(topics));
    } else if(url === '/upvote') {
      let data = '';
      request.on('data', function(chunk) {
        data += chunk.toString();
      });
      request.on('end', async function() {
        console.log(JSON.parse(data));
        const {id} = JSON.parse(data);
        const sql = 'UPDATE topics SET upvote = upvote + 1 WHERE ID = ?';
        await client.execute({sql, args: [id]});
        response.writeHead(200).end();
      });
    } else if(url === '/downvote') {
      let data = '';
      request.on('data', function(chunk) {
        data += chunk.toString();
      });
      request.on('end', async function() {
        console.log(JSON.parse(data));
        const {id} = JSON.parse(data);
        const sql = 'UPDATE topics SET downvote = downvote - 1 WHERE ID = ?';
        await client.execute({sql, args: [id]});
        response.writeHead(200).end();
      });
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