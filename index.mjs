
export default class TTLCache {
  /**
   * 构造函数
   * @param options 配置选项，包含ttl(过期时间)和capacity(容量)
   */
  constructor(options = {}) {
    this.ttl = options.ttl || Infinity;
    this.capacity = options.capacity || Infinity;
    this.store = new Map();
    this.head = this.tail = null;
    this.size = 0;
    Object.defineProperty(this, 'size', {
      get() {
        return this.store.size;
      },
      configurable: false
    });
  }
  /**
   * 获取缓存，惰性删除
   * @param key 缓存键
   * @returns 如果缓存存在且未过期返回值，否则返回null
   */
  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() - item.time > this.ttl) {
      this.removeItem(key);
      return null;
    }
    return item.value;
  }
  /**
   * 设置缓存，包含已存在或新增
   * @param key 缓存键
   * @param value 缓存值
   */
  put(key, value) {
    if (this.size === 0) {
      this.store.set(key, {
        key,
        value,
        pre: null,
        next: null,
        time: Date.now()
      });
      this.head = this.tail = key;
      return;
    }
    if (this.store.has(key)) {
      const curItem = this.store.get(key);
      curItem.value = value;
      curItem.time = Date.now();
      this.moveToTail(key);
      return;
    }
    const curTail = this.store.get(this.tail);
    const newItem = {
      key,
      value,
      pre: curTail,
      next: null,
      time: Date.now()
    };
    curTail.next = newItem;
    this.store.set(key, newItem);
    this.tail = key;
    if (this.size > this.capacity) {
      this.removeItem(this.head);
    }
  }
  /**
   * 移除节点
   * @param key
   */
  removeItem(key) {
    if (!this.store.has(key)) return;
    const curItem = this.store.get(key);
    if (this.size === 1) {
      this.head = this.tail = null;
    } else if (this.head === key) {
      this.head = curItem.next.key;
      curItem.next.pre = null;
    } else if (this.tail === key) {
      this.tail = curItem.pre.key;
      curItem.pre.next = null;
    } else {
      curItem.pre.next = curItem.next;
      curItem.next.pre = curItem.pre;
    }
    this.store.delete(key);
  }
  /**
   * 将节点移动到队尾，队尾的节点一定是最后一个更新的
   * @param key
   */
  moveToTail(key) {
    if (!this.store.has(key)) return;
    if (this.tail === key) return;
    const curItem = this.store.get(key);
    this.removeItem(key);
    const curTail = this.store.get(this.tail);
    curTail.next = curItem;
    curItem.pre = curTail;
    curItem.next = null;
    this.tail = key;
    this.store.set(key, curItem);
  }
};

