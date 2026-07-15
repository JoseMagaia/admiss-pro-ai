type Listener = (...args: unknown[]) => void;

export class EventEmitter {
  private readonly listenersByEvent = new Map<string | symbol, Listener[]>();
  private maxListeners = 10;

  addListener(eventName: string | symbol, listener: Listener) {
    return this.on(eventName, listener);
  }

  on(eventName: string | symbol, listener: Listener) {
    const listeners = this.listenersByEvent.get(eventName) ?? [];
    if (eventName !== "newListener") this.emit("newListener", eventName, listener);
    listeners.push(listener);
    this.listenersByEvent.set(eventName, listeners);
    return this;
  }

  once(eventName: string | symbol, listener: Listener) {
    const wrapped: Listener = (...args) => {
      this.removeListener(eventName, wrapped);
      listener(...args);
    };
    return this.on(eventName, wrapped);
  }

  prependListener(eventName: string | symbol, listener: Listener) {
    const listeners = this.listenersByEvent.get(eventName) ?? [];
    listeners.unshift(listener);
    this.listenersByEvent.set(eventName, listeners);
    return this;
  }

  prependOnceListener(eventName: string | symbol, listener: Listener) {
    const wrapped: Listener = (...args) => {
      this.removeListener(eventName, wrapped);
      listener(...args);
    };
    return this.prependListener(eventName, wrapped);
  }

  removeListener(eventName: string | symbol, listener: Listener) {
    const listeners = this.listenersByEvent.get(eventName);
    if (!listeners) return this;
    const next = listeners.filter((item) => item !== listener);
    if (next.length) this.listenersByEvent.set(eventName, next);
    else this.listenersByEvent.delete(eventName);
    if (next.length !== listeners.length && eventName !== "removeListener") {
      this.emit("removeListener", eventName, listener);
    }
    return this;
  }

  off(eventName: string | symbol, listener: Listener) {
    return this.removeListener(eventName, listener);
  }

  removeAllListeners(eventName?: string | symbol) {
    if (eventName === undefined) this.listenersByEvent.clear();
    else this.listenersByEvent.delete(eventName);
    return this;
  }

  emit(eventName: string | symbol, ...args: unknown[]) {
    const listeners = this.listenersByEvent.get(eventName) ?? [];
    for (const listener of [...listeners]) listener(...args);
    return listeners.length > 0;
  }

  listeners(eventName: string | symbol) {
    return [...(this.listenersByEvent.get(eventName) ?? [])];
  }

  listenerCount(eventName: string | symbol) {
    return this.listenersByEvent.get(eventName)?.length ?? 0;
  }

  eventNames() {
    return [...this.listenersByEvent.keys()];
  }

  setMaxListeners(n: number) {
    this.maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this.maxListeners;
  }
}

export function once(emitter: EventEmitter, eventName: string | symbol) {
  return new Promise<unknown[]>((resolve) => {
    emitter.once(eventName, (...args) => resolve(args));
  });
}

export default { EventEmitter, once };
