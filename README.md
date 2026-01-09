

> Written with [StackEdit](https://stackedit.io/).

# fast-ttl-cache

An in-memory cache implemented in Node.js, featuring configurable ttl and a maximum size. It uses a doubly linked list data structure and lazy deletion for expired data, all without relying on any JavaScript timer methods.

## Installation

```shell
npm install fast-ttl-cache --save
```

## Usage

```javascript
import FastTTLCache from 'fast-ttl-cache';

const cache = new FastTTLCache({
  ttl: 5 * 1000, // ttl in millseconds, get an outdated data will return null and delete it
  capacity: 1000, // max capacity, When the capacity is exceeded, the least recently updated data will be removed.
  cloneLevel: 0, // 0 (no clone), 1 (shallow clone), 2 (deep clone), defaults to 0
});

cache.put('key1', 'value1');
cache.put('key2', 'value2');
cache.put('key3', 'value3');
console.log(cache.get('key2')); // return value2

// wait for 5 seconds
await new Promise(resolve => setTimeout(resolve, 5000));

cache.get('key1'); // return null and key1 will be removed
cache.size; // return 2, key2 & key3 are outdated but are not been removed yet

cache.get('key3'); // return null and key2 & key3 will be removed
cache.size; // return 0
```

## API
```FastTTLCache(options) consturctor```

- ```options.ttl```: number of millseconds, defaults to Infinity
- ```options.capacity```: number of max capacity, defaults to Infinity
- ```options.cloneLevel```: number of clone level, defaults to 0 (no clone), 1 (shallow clone), 2 (deep clone)

```FastTTLCache.prototype.put(key, value)```

- Add or update the value into cache with key and timestamp.

```FastTTLCache.prototype.get(key)```

- Get the value of the key from cache, return null if the key is not exists or has been expired.
- if cloneLevel is 0, return the original data
- if cloneLevel is 1, return the shallow cloned data
- if cloneLevel is 2, return the deep cloned data

```FastTTLCache.prototype.size```

- return the current size of cache, note because of the lazy deletion mechanism, it's not the exact number of cache items that are valid.

## License
MIT
