
import {
  CacheItem,
  CacheOptions,
} from './types.js';

/**
 * FastTTLCache 缓存类
 * @brief 不使用 timer 实现的支持 ttl 和 capacity 的缓存类，惰性删除
 */
export default class FastTTLCache {
  /** 缓存过期时间(毫秒) */
  public ttl: number;
  /** 缓存最大容量 */
  public capacity: number;
  /** 存储缓存项的Map */
  private store: Map<string, CacheItem> = new Map();
  /** 链表头部指针，指向最久未更新的节点 */
  public head: CacheItem | null = null;
  /** 链表尾部指针，指向最新更新的节点 */
  public tail: CacheItem | null = null;
  /** 缓存大小 */
  public size: number = 0;

  /**
   * 构造函数
   * @param options 配置选项，包含ttl(过期时间)和capacity(容量)
   */
  constructor (options: CacheOptions = {}) {
    this.ttl = options.ttl || Infinity;
    this.capacity = options.capacity || Infinity;
    Object.defineProperties(this, {
      size: {
        get() {
          return this.store.size;
        },
        configurable: false,
      },
      store: {
        configurable: false,
        enumerable: false,
        writable: false,
      },
      head: {
        configurable: false,
        enumerable: false,
      },
      tail: {
        configurable: false,
        enumerable: false,
      },
    });
  }

  /**
   * 获取缓存，惰性删除
   * @param key 缓存键
   * @returns 如果缓存存在且未过期返回值，否则返回null
   */
  get (key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;
    // 检查缓存是否过期，过期则删除
    if (Date.now() - item.time > this.ttl) {
      this.del(item);
      return null;
    }
    return item.value;
  }

  /**
   * 设置缓存，包含已存在或新增
   * @param key 缓存键
   * @param value 缓存值
   */
  put (key: string, value: any): void {
    // 缓存为空时的处理
    if (this.size === 0) {
      const item = {
        key,
        value,
        prev: null,
        next: null,
        time: Date.now(),
      };
      this.head = this.tail = item;
      this.store.set(key, item);
      return;
    }

    // 数据已存在时的处理
    if (this.store.has(key)) {
      // 更新节点的值和时间戳
      const item = this.store.get(key);
      item.value = value;
      item.time = Date.now();

      // 移动到尾部
      this.moveToTail(item);
      return;
    }

    // 新数据插入尾部
    const item = {
      key,
      value,
      prev: this.tail,
      next: null,
      time: Date.now(),
    };
    this.tail.next = item;
    this.tail = item;
    this.store.set(key, item);

    // 超出容量时，删除最久未更新的节点（头部节点）
    if (this.size > this.capacity) {
      this.del(this.head);
    }
  }

  /**
   * 移除节点
   * @param item CacheItem
   */
  private del (item: CacheItem): boolean {
    const key = item.key;
    if (!this.store.has(key)) return false;
    // 获取当前节点
    if (this.size === 1) { // 只有一个节点的情况
      this.head = this.tail = null;
    } else if (this.head === item) { // 处理头部节点的情况
      this.head = item.next;
      this.head.prev = null;
    } else if (this.tail === item) { // 处理尾部节点的情况
      this.tail = item.prev;
      this.tail.next = null;
    } else { // 处理中间节点的情况
      item.prev.next = item.next;
      item.next.prev = item.prev;
    }
    // 从 store 里删除节点
    this.store.delete(key);
    return true;
  }

  /**
   * 将节点移动到队尾，队尾的节点一定是最后一个更新的
   * @param item CacheItem
   */
  private moveToTail (item: CacheItem): void {
    const key = item.key;
    if (!this.store.has(key)) return;
    // 当前已经是尾部节点了
    if (this.tail === item) return;

    // 先移除节点
    this.del(item);

    // 将节点移动到队尾
    item.prev = this.tail;
    item.next = null;
    this.tail.next = item;
    this.tail = item;
    // 设置缓存
    this.store.set(key, item);
  }
}
