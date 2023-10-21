/**
 * A demo file to show how to use redis_cli.js.
 * Following the 3 steps to demo your boyfriend's redis client.
 */

// STEP1: creat a redis client
import RedisClient from './redis_cli.js'
const redis = new RedisClient();
await redis.test_connection();

// Emulate a series of users data as jsonObject
for (let i = 1; i <= 10; i++) {
  const jsonObject = {
    table_idx: 'TestTable',
    user_id: i,
    name: 'John' + i,
    age: 20+i,
    gender: i % 2,
  }

  // STEP2: Replace jsonObject as your dict
  await redis.write(jsonObject, err => {
    if (err) {
      console.error('Error writing JSON object: %s %s', err, jsonObject)
    }
  })
}

// STEP3: retrieve users data to a list
let list = await redis.read("TestTable", '*', (err, list) => {
  if (err) throw err;
  return list;
})
console.log(list);

// Finally, remember to close the client after using.
await redis.close();


