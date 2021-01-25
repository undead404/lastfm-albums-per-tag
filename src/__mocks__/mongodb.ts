import { Cached } from '../types';

export function getCache<T>(): Promise<Cached<T> | null> {
  return Promise.resolve(null);
}

export function setCache(): Promise<void> {
  return Promise.resolve();
}
