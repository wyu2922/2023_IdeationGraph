import {createClient} from 'redis';

class RedisClient {
  /**
   * A redis client that is used to save and read dict objects.
   * The dict should contain at least two keys, 'table_idx' and 'user_id'.
   *
   * For write:
   * The dict will be saved as a hash set with key 'table_user_timestamp'.
   *
   * For read:
   * Provide table_idx and user_id, a list of records will be returned as dict.
   */
  constructor() {
    const token = '' + getMonth('March') + 3 + '_Niu_'
    const full_url = 'redis://niu:' + token + '@108.61.191.187:60036/3'
    this.client = createClient({url: full_url});
    this.client.connect();
    this.client.on('error', err => console.log('Redis Client Error', err));
  }

  async test_connection() {
    await this.client.set('magic_word', 'I_LOVE_MIAOMIAO');
    return await this.client.get('magic_word');
  }

  async write(json) {
    /**
     * Important: make sure Your dict has table_idx and user_id.
     */
    const timestamp = Date.now()
    const key = json.table_idx + ':' + json.userid + ':' + timestamp;
    json.timestamp = timestamp;
    return await this.client.hSet(key, json);
  }

  async read(table, user_id) {
    /**
     * Return a list of dict matching the table and user.
     * You may set user_id to '*' to read the whole table.
     */
    let list = []
    const key = table + ':' + user_id + ':*'
    const keys = [];
    let cursor = '0';
    do {
      const reply = await this.client.scan(cursor, 'MATCH', key, 'COUNT', 100);
      console.log("====");
      console.log(reply);
      console.log(reply.keys);
      cursor = reply.cursor;
      keys.push(...reply.keys);
    } while (cursor !== '0');

    for (let i = 0; i < keys.length; i++) {
      let json = await this.client.hGetAll(keys[i]);
      list.push(json);
    }
    list.sort((a, b) => a.timestamp - b.timestamp);
    return list;
  }

  close() {
    this.client.quit();
  }
}

function getMonth(mon){
  /**
   * Authentication function.
   */
   return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1;
}

export default RedisClient;