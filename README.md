

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
});

cache.put('key1', 'value1');
cache.put('key2', 'value2');
cache.get('key2'); // return value2

// wait for 5 seconds
cache.get('key1'); // return null and key1 will be removed
cache.size; // return 1, key2 is outdated but is not been removed yet

cache.get('key2'); // return null and key2 will be removed
cache.size; // return 0
```

## API
```FastTTLCache(options) consturctor```

options.ttl: number of millseconds, defaults to Infinity
options.capacity: number of max capacity, defaults to Infinity

```FastTTLCache.prototype.put(key, value)```

Add or update the value into cache with key and timestamp.

```FastTTLCache.prototype.get(key)```

Get the value of the key from cache, return null if the key is not exists or has been expired.

```FastTTLCache.prototype.size```

return the current size of cache.

## License
MIT
