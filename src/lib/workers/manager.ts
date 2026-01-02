/**
 * Web Worker Manager
 * Manages background sync worker for offline support
 */

export interface SyncItem {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: any;
}

export class WorkerManager {
  private worker: Worker | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = typeof Worker !== "undefined";
  }

  init() {
    if (!this.isSupported) {
      console.warn("Web Workers not supported in this environment");
      return;
    }

    try {
      this.worker = new Worker(new URL("./sync.worker.ts", import.meta.url), {
        type: "module",
      });

      this.worker.onmessage = (event) => {
        this.handleWorkerMessage(event.data);
      };

      this.worker.onerror = (error) => {
        console.error("Worker error:", error);
      };
    } catch (error) {
      console.error("Failed to initialize worker:", error);
    }
  }

  addTask(item: SyncItem) {
    if (!this.worker) {
      console.warn("Worker not initialized");
      return;
    }

    this.worker.postMessage({
      type: "ADD_TASK",
      payload: {
        ...item,
        timestamp: Date.now(),
        retries: 0,
      },
    });
  }

  async sync() {
    return new Promise<void>((resolve) => {
      if (!this.worker) {
        resolve();
        return;
      }

      const handleSync = (event: MessageEvent) => {
        if (event.data.type === "SYNC_COMPLETE") {
          this.worker?.removeEventListener("message", handleSync);
          resolve();
        }
      };

      this.worker.addEventListener("message", handleSync);
      this.worker.postMessage({ type: "SYNC" });
    });
  }

  clearTasks() {
    if (!this.worker) return;
    this.worker.postMessage({ type: "CLEAR_TASKS" });
  }

  private handleWorkerMessage(data: any) {
    switch (data.type) {
      case "SYNC_SUCCESS":
        console.log("Sync successful:", data.data);
        break;
      case "SYNC_FAILED":
        console.warn("Sync failed:", data.data);
        break;
      case "SYNC_COMPLETE":
        console.log("Sync complete:", data.data);
        break;
    }
  }

  terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

// Create singleton instance
export const workerManager = new WorkerManager();
