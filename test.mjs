
import TTLCache from './index.mjs';

const sleep = ms => new Promise(res => setTimeout(res, ms));

const c = new TTLCache({
  ttl: 1000,
  capacity: 3,
});

c.put('a', 'aaaa');
c.put('a', 'aaaaaa');

await sleep(200);
c.put('b', 'bbbb');

await sleep(500);
c.put('c', 'cccc');

await sleep(500);
c.put('b', 'bbbbbb');

await sleep(600);
c.put('d', 'dddd');

console.log('b', c.get('b'));

await sleep(600);
c.put('e', 'eeee');

console.log(c);
console.log(c.store.keys());
console.log('b', c.get('b'));
console.log('c', c.get('c'));
console.log('a', c.get('a'));
console.log('e', c.get('e'));
