
import FastTTLCache from '../src/index';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      expect(cache.get('key')).toEqual('value');

      cache.put('key', 'newValue');
      expect(cache.get('key')).toEqual('newValue');
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
      expect(cache.get('key1')).toEqual(null);
    });

  });

  describe('get', () => {
    test('获取缓存值', () => {
      const cache = new FastTTLCache();
      cache.put('key', 'value');
      expect(cache.get('key')).toEqual('value');
      expect(cache.get('keyNotExists')).toEqual(null);
    });

    test('no clone', () => {
      const cache = new FastTTLCache({
        cloneLevel: 0,
      });
      const str = 'value';
      const obj = { a: { b : 1 } };
      cache.put('str', str);
      cache.put('obj', obj);
      expect(cache.get('str')).toBe(str);
      expect(cache.get('obj')).toBe(obj);
    });

    test('shallow clone', () => {
      const cache = new FastTTLCache({
        cloneLevel: 1,
      });
      const str = 'value';
      const obj = { a: { b : 1 } };
      cache.put('str', str);
      cache.put('obj', obj);
      expect(cache.get('str')).toBe(str);
      expect(cache.get('obj')).not.toBe(obj);
      expect(cache.get('obj').a).toBe(obj.a);
    });

    test('deep clone', () => {
      const cache = new FastTTLCache({
        cloneLevel: 2,
      });
      const str = 'value';
      const obj = { a: { b : 1 } };
      cache.put('str', str);
      cache.put('obj', obj);
      expect(cache.get('str')).toBe(str);
      expect(cache.get('obj')).not.toBe(obj);
      expect(cache.get('obj').a).not.toBe(obj.a);
    });

    test('缓存过期被删除', async () => {
      const cache = new FastTTLCache({
        ttl: 80,
      });
      cache.put('key', 'value');
      cache.put('key1', 'value1');
      cache.put('key2', 'value2');
      cache.put('key3', 'value3');

      // 等待30ms，缓存不应该过期
      await sleep(30);
      expect(cache.get('key')).toEqual('value');
      expect(cache.head?.key).toEqual('key');
      expect(cache.tail?.key).toEqual('key3');
      expect(cache.size).toEqual(4);

      // 再等待60ms，总共90ms，缓存应该过期
      await sleep(60);
      expect(cache.size).toEqual(4);
      // 获取 key1 的时候包括 key1 及之前的 key 会被全部删除
      expect(cache.get('key1')).toEqual(null);
      expect(cache.head?.key).toEqual('key2');
      expect(cache.tail?.key).toEqual('key3');
      expect(cache.size).toEqual(2);
      // 获取 key3 的时候包括 key3 及之前的 key 会被全部删除
      expect(cache.get('key3')).toEqual(null);
      expect(cache.head).toEqual(null);
      expect(cache.tail).toEqual(null);
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

      expect(cache.get('key1')).toEqual(null);
      expect(cache.get('key3')).toEqual('value3');
      expect(cache.size).toEqual(2);
    });

  });

});
