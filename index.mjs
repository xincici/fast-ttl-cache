
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
    // 检查缓存是否过期，过期则删除
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
    // 缓存为空时的处理
    if (this.size === 0) {
      this.store.set(key, {
        key,
        value,
        pre: null,
        next: null,
        time: Date.now(),
      });
      this.head = this.tail = key;
      return;
    }

    // 数据已存在时的处理
    if (this.store.has(key)) {
      // 更新节点的值和时间戳
      const curItem = this.store.get(key);
      curItem.value = value;
      curItem.time = Date.now();

      // 移动到尾部
      this.moveToTail(key);
      return;
    }

    // 新数据插入尾部
    const curTail = this.store.get(this.tail);
    const newItem = {
      key,
      value,
      pre: curTail,
      next: null,
      time: Date.now(),
    };
    curTail.next = newItem;
    this.store.set(key, newItem);
    this.tail = key;

    // 超出容量时，删除最久未更新的节点（头部节点）
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
    // 获取当前节点
    const curItem = this.store.get(key);
    if (this.size === 1) { // 只有一个节点的情况
      this.head = this.tail = null;
    } else if (this.head === key) { // 处理头部节点的情况
      this.head = curItem.next.key;
      curItem.next.pre = null;
    } else if (this.tail === key) { // 处理尾部节点的情况
      this.tail = curItem.pre.key;
      curItem.pre.next = null;
    } else { // 处理中间节点的情况
      curItem.pre.next = curItem.next;
      curItem.next.pre = curItem.pre;
    }
    // 从 store 里删除节点
    this.store.delete(key);
  }
  /**
   * 将节点移动到队尾，队尾的节点一定是最后一个更新的
   * @param key
   */
  moveToTail(key) {
    if (!this.store.has(key)) return;
    // 当前已经是尾部节点了
    if (this.tail === key) return;

    // 获取当前节点
    const curItem = this.store.get(key);
    // 先移除节点
    this.removeItem(key);

    // 获取队尾节点
    const curTail = this.store.get(this.tail);

    // 将节点移动到队尾
    curTail.next = curItem;
    curItem.pre = curTail;
    curItem.next = null;
    this.tail = key;
    // 设置缓存
    this.store.set(key, curItem);
  }
};

