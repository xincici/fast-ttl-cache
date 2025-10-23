
import FastTTLCache from './dist/index.mjs';

const sleep = ms => new Promise(res => setTimeout(res, ms));

const ftc = new FastTTLCache({
  ttl: 1000,
  capacity: 5,
});

ftc.put('a', 'aaaa');
ftc.put('a', 'aaaaaa');

await sleep(200);
ftc.put('b', 'bbbb');

await sleep(500);
ftc.put('c', 'cccc');

await sleep(500);
ftc.put('b', 'bbbbbb');

await sleep(600);
ftc.put('d', 'dddd');

console.log('b', ftc.get('b'));

await sleep(600);
ftc.put('e', 'eeee');

console.log(ftc);
console.log(ftc.store.keys());
console.log('b', ftc.get('b'));
console.log('c', ftc.get('c'));
console.log('a', ftc.get('a'));
console.log('e', ftc.get('e'));
console.log(ftc.store.keys());
