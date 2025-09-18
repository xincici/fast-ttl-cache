
import FastTTLCache from '../src/index.js';

describe('FastTTLCache', () => {

  describe('constructor', () => {
    test('初始化实例', () => {
      const cache = new FastTTLCache();
      expect(cache).toBeInstanceOf(FastTTLCache);
      expect(cache.ttl).toEqual(Infinity);
      expect(cache.capacity).toEqual(Infinity);
      expect(cache.size).toEqual(0);
      expect(cache.head).toEqual(null);
      expect(cache.tail).toEqual(null);
    });

    test('设置缓存最大容量为 100, ttl 为 60 秒', () => {
      const cache = new FastTTLCache({
        ttl: 60 * 1000,
        capacity: 100
      });
      expect(cache.ttl).toEqual(60 * 1000);
      expect(cache.capacity).toEqual(100);
    });

  });

  describe('put', () => {
    test('设置缓存值 + 覆盖已存在 key', () => {
      const cache = new FastTTLCache();
      cache.put('key', 'value');
      expect(cache.getToken('key')).toEqual('value');

      cache.put('key', 'newValue');
      expect(cache.getToken('key')).toEqual('newValue');
    });

    test('验证 head tail 指向', () => {
      const cache = new FastTTLCache();
      cache.put('key1', 'value1');
      expect(cache.head?.key).toEqual('key1');
      expect(cache.tail?.key).toEqual('key1');

      cache.put('key2', 'value2');
      expect(cache.head?.key).toEqual('key1');
      expect(cache.tail?.key).toEqual('key2');

      cache.put('key1', 'newValue1');
      expect(cache.head?.key).toEqual('key2');
      expect(cache.tail?.key).toEqual('key1');

      cache.put('key3', 'value3');
      expect(cache.head?.key).toEqual('key2');
      expect(cache.tail?.key).toEqual('key3');
    });

    test('超出容量 head tail 指向', () => {
      const cache = new FastTTLCache({
        capacity: 2,
      });
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      expect(cache.head?.key).toEqual('key2');
      expect(cache.tail?.key).toEqual('key3');
      expect(cache.size).toEqual(2);
      expect(cache.getToken('key1')).toEqual(null);
    });

  });

  describe('getToken', () => {
    test('获取缓存值', () => {
      const cache = new FastTTLCache();
      cache.put('key', 'value');
      expect(cache.getToken('key')).toEqual('value');
      expect(cache.getToken('keyNotExists')).toEqual(null);
    });

    test('缓存过期被删除', async () => {
      const cache = new FastTTLCache({
        ttl: 100,
      });
      cache.put('key', 'value');

      // 等待50ms，缓存不应该过期
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(cache.getToken('key')).toEqual('value');
      expect(cache.size).toEqual(1);

      // 再等待70ms，总共120ms，缓存应该过期
      await new Promise(resolve => setTimeout(resolve, 70));
      expect(cache.getToken('key')).toEqual(null);
      expect(cache.size).toEqual(0);
    });
    
    test('超出容量限制被删除', () => {
      const cache = new FastTTLCache({
        ttl: 10 * 1000,
        capacity: 2,
      });
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      expect(cache.getToken('key1')).toEqual(null);
      expect(cache.getToken('key3')).toEqual('value3');
      expect(cache.size).toEqual(2);
    });

  });

});