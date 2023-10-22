// const express = require('express');
// const redis = require('redis');
// const bodyParser = require('body-parser');
// const RedisClient = require('./toolkits/redis_cli')
import express from "express";
import cors from "cors"
import redis, {createClient} from "redis"
import bodyParser from "body-parser";
import RedisClient from "./redis_cli.js";
const app = express();


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

app.listen(60000, () => {
  console.log('Server is running on port 60000');
});
