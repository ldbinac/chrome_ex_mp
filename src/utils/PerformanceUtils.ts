export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();

  static startMeasure(label: string): void {
    performance.mark(`${label}-start`);
  }

  static endMeasure(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    
    const measure = performance.getEntriesByName(label)[0];
    const duration = measure.duration;
    
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    this.metrics.get(label)!.push(duration);
    
    performance.clearMarks(`${label}-start`);
    performance.clearMarks(`${label}-end`);
    performance.clearMeasures(label);
    
    return duration;
  }

  static getAverage(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  static getMax(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    return Math.max(...values);
  }

  static getMin(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    return Math.min(...values);
  }

  static getCount(label: string): number {
    const values = this.metrics.get(label);
    return values ? values.length : 0;
  }

  static getAllMetrics(): Record<string, { avg: number; max: number; min: number; count: number }> {
    const result: Record<string, any> = {};
    this.metrics.forEach((values, label) => {
      result[label] = {
        avg: this.getAverage(label),
        max: this.getMax(label),
        min: this.getMin(label),
        count: this.getCount(label),
      };
    });
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

export class Debounce {
  private timer: NodeJS.Timeout | null = null;

  constructor(private delay: number) {}

  execute(callback: () => void): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      callback();
      this.timer = null;
    }, this.delay);
  }

  cancel(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export class Throttle {
  private lastExecution = 0;
  private timer: NodeJS.Timeout | null = null;

  constructor(private delay: number) {}

  execute(callback: () => void): void {
    const now = Date.now();
    const timeSinceLastExecution = now - this.lastExecution;

    if (timeSinceLastExecution >= this.delay) {
      callback();
      this.lastExecution = now;
    } else {
      if (this.timer !== null) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => {
        callback();
        this.lastExecution = Date.now();
        this.timer = null;
      }, this.delay - timeSinceLastExecution);
    }
  }

  cancel(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

export class Cache<T> {
  private cache: Map<string, { value: T; timestamp: number }> = new Map();
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    this.defaultTTL = defaultTTL;
  }

  set(key: string, value: T, ttl?: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now() + (ttl || this.defaultTTL),
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp) {
        this.cache.delete(key);
      }
    }
  }

  size(): number {
    return this.cache.size;
  }
}

export class BatchProcessor<T> {
  private queue: T[] = [];
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private batchSize: number,
    private delay: number,
    private processor: (batch: T[]) => Promise<void>
  ) {}

  add(item: T): void {
    this.queue.push(item);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    if (this.timer !== null) return;

    this.timer = setTimeout(() => {
      this.flush();
    }, this.delay);
  }

  private async flush(): Promise<void> {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.batchSize);
    await this.processor(batch);

    if (this.queue.length > 0) {
      this.scheduleFlush();
    }
  }

  async flushAll(): Promise<void> {
    while (this.queue.length > 0) {
      await this.flush();
    }
  }

  clear(): void {
    this.queue = [];
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  size(): number {
    return this.queue.length;
  }
}