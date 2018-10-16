// @flow

/**
 * Simple generic cache with automatic pruning.
 *
 * Automatic pruning is based on max size (number of entries) and how recently
 * each entry was accessed (ie via `add` and `get` methods). Cache is a generic
 * class where `S` is the cache entry signature type and `V` is the value type.
 */
export default class Cache<S, V> {
  _maxSize: number
  _data: Map<S, V>

  constructor(maxSize: number) {
    this._maxSize = maxSize;
    this._data = new Map();
  }

  /**
   * Size (number of entries) in cache
   */
  get size(): number { return this._data.size; }

  /**
   * Adds a value to the Cache
   */
  add(signature: S, value: V): void {
    // Use .get() to return value and update cache entry age
    const existing = this.get(signature);
    if (!existing) {
      // Add new value to cache
      this._data.set(signature, value);

      // Prune older entries if necessary
      this._prune();
    }
  }

  /**
   * Returns a value from the cache or `undefined` not found
   */
  get(signature: S): V | void {
    const value: V | void = this._data.get(signature);
    if (value) {
      // Delete and readd cache entry to push it to the top/end of
      // map so it won't be pruned
      this._data.delete(signature);
      this._data.set(signature, value);
    }
    return value;
  }

  /**
   * Prunes the cache of older entries to bring cache back down to maxSSize
   * @private
   */
  _prune(): void {
    const numToDelete = this._data.size - this._maxSize;
    for (let i = 0; i < numToDelete; i++) {
      // $flow-disable-line flow is confused here
      const entry: [S, V] = this._data.entries().next().value;
      this._data.delete(entry[0]);
    }
  }
}
