/**
 * Simple generic cache with automatic pruning based on maxSize and entry access age
 */
// @flow


export default class Cache<K, V> {
  _maxSize: number
  _data: Map<K, V>

  constructor(maxSize: number) {
    this._maxSize = maxSize;
    this._data = new Map();
  }

  get size() { return this._data.size; }

  add(key: K, value: V) {
    // Use .get() to return value and update cache entry age
    const existing = this.get(key);
    if (!existing) {
      // Add new value to cache
      this._data.set(key, value);

      // Prune older entries if necessary
      this.prune();
    }
  }

  get(key: K): V | void {
    const value: V | void = this._data.get(key);
    if (value) {
      // Delete and readd cache entry to push it to the top/end of
      // map so it won't be pruned
      this._data.delete(key);
      this._data.set(key, value);
    }
    return value;
  }

  prune() {
    const numToDelete = this._data.size - this._maxSize
    for (let i = 0; i < numToDelete; i++) {
      // $flow-disable-line flow is confused here
      const entry: [K, V] = this._data.entries().next().value;
      this._data.delete(entry[0]);
    }
  }
}