import { createClient } from 'redis';

const client = createClient({
  url: 'redis://niu:33_Niu_@108.61.191.187:60036/3'
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

const value = await client.get('key');
