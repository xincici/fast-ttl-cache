
/**
 * 缓存项的数据结构，包含键值对和双向链表指针
 */
export interface CacheItem {
  /** 缓存项的键 */
  key: string;
  /** 缓存项的值 */
  value: any;
  /** 前一个节点指针 */
  prev: CacheItem | null;
  /** 后一个节点指针 */
  next: CacheItem | null;
  /** 缓存时间戳 */
  time: number;
}

/**
 * FastTTLCache constructor options
 */
export interface CacheOptions {
  /** 缓存过期时间(毫秒) */
  ttl?: number;
  /** 缓存最大容量 */
  capacity?: number;
}