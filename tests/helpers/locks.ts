// Models exclusive Web Locks, including waiting writers and non-waiting readers.
export function testLocks(): LockManager {
  const held = new Set<string>();
  const queues = new Map<string, (() => void)[]>();
  return {
    request: <T>(name: string, options: LockOptions | LockGrantedCallback<T>, callback?: LockGrantedCallback<T>): Promise<T> => {
      const fn = typeof options === 'function' ? options : callback!;
      if (held.has(name) && typeof options !== 'function' && options.ifAvailable) return Promise.resolve().then(() => fn(null));
      return new Promise<T>((resolve, reject) => {
        const run = () => {
          held.add(name);
          Promise.resolve().then(() => fn({ name, mode: 'exclusive' })).then(resolve, reject).finally(() => {
            held.delete(name);
            queues.get(name)?.shift()?.();
          });
        };
        if (!held.has(name)) run();
        else { const queue = queues.get(name) || []; queue.push(run); queues.set(name, queue); }
      });
    }
  } as LockManager;
}
