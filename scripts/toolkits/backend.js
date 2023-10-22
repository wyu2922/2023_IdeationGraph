import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import https from "https"
import fs from "fs"
import RedisClient from "./redis_cli.js"
const app = express();

const privateKey = fs.readFileSync('~/private-key.pem', 'utf8');
const certificate = fs.readFileSync('~/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

app.use(bodyParser.json());
app.use(cors());
let redis_client = new RedisClient();


app.get('/', (req, res) => {
  redis_client.test_connection().then(r => {
    const htmlResponse = `<html lang="EN"><body><h3>This page will test the backend Redis. Say:</h3><textarea>${r}</textarea></body></html>`;
    res.status(200).send(htmlResponse);
  });


});
app.post('/set', (req, res) => {
  const json = req.body;
  if (!json) {
    return res.status(400).json({ error: 'Missing key in the request body' });
  }
  console.log("/set ", json)
  redis_client.write(json).then(r => res.status(200).json({ message: 'success'}))
});

app.post('/get', (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Missing key in the request body' });
  }
  console.log("/get ", req.body)
  redis_client.read(req.body.table_idx, req.body.userid).then(r => {
    res.status(200).json(r)
  })
});

const httpsServer = https.createServer(credentials, app);
httpsServer.listen(60000, () => {
  console.log('Server is running on port 60000');
});
