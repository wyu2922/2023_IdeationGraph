import { createClient } from 'redis';

function getMonth(mon){
   return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
}

const token = '' + getMonth('March') + 3 + '_Niu_'
const full_url = 'redis://niu:' + token + '@108.61.191.187:60036/3'
const client = createClient({
  url: full_url
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('magic_word', 'I_LOVE_MIAOMIAO');
const value = await client.get('magic_word');

console.log(value)



// TEST CASES //
// Emulate a series of users data
for (let i = 1; i <= 10; i++) {
  const person = {
    id: i,
    timestamp: Date.now(),
    name: 'John',
    age: 18,
    gender: 'male',
  }
  const key = 'TestTable:' + person.id + ':' + person.timestamp
  await client.hSet(key, {
      name: person.name,
      age: person.age,
      gender: person.gender,
  })
  console.log('Finished input')
}

// Emulate to retrieve all users data
const keys = await client.keys('TestTable*', (err, keys) => {
  if (err) throw err;
  return keys
});

for (let i = 0; i < keys.length; i++) {
  console.log('Current key: ', keys[i])
  let userSession = await client.hGetAll(keys[i]);
  console.log(JSON.stringify(userSession, null, 2));
}

// END //
await client.quit();
