/**
 * Background Sync Worker
 * Handles offline queue synchronization with the server
 */

interface SyncMessage {
  type: "SYNC" | "ADD_TASK" | "CLEAR_TASKS";
  payload?: any;
}

interface QueueItem {
  id: string;
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  data?: any;
  timestamp: number;
  retries: number;
}

let queue: Map<string, QueueItem> = new Map();

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<SyncMessage>) => {
  const { type, payload } = event.data;

  switch (type) {
    case "ADD_TASK":
      addToQueue(payload);
      break;
    case "SYNC":
      await syncQueue();
      break;
    case "CLEAR_TASKS":
      queue.clear();
      break;
  }
};

function addToQueue(item: QueueItem) {
  queue.set(item.id, {
    ...item,
    retries: item.retries || 0,
  });
}

async function syncQueue() {
  const failedItems: QueueItem[] = [];

  for (const [id, item] of queue.entries()) {
    try {
      const response = await fetch(item.endpoint, {
        method: item.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: item.data ? JSON.stringify(item.data) : undefined,
      });

      if (response.ok) {
        queue.delete(id);
        self.postMessage({
          type: "SYNC_SUCCESS",
          data: { id, status: "synced" },
        });
      } else if (response.status >= 500 || response.status === 429) {
        // Retry on server errors or rate limiting
        item.retries++;
        if (item.retries < 3) {
          failedItems.push(item);
        } else {
          queue.delete(id);
          self.postMessage({
            type: "SYNC_FAILED",
            data: { id, status: "max_retries_exceeded" },
          });
        }
      } else {
        // Client errors - don't retry
        queue.delete(id);
        self.postMessage({
          type: "SYNC_FAILED",
          data: { id, status: `client_error_${response.status}` },
        });
      }
    } catch (error) {
      item.retries++;
      if (item.retries < 3) {
        failedItems.push(item);
      } else {
        queue.delete(id);
        self.postMessage({
          type: "SYNC_FAILED",
          data: { id, status: "network_error", error: String(error) },
        });
      }
    }
  }

  self.postMessage({
    type: "SYNC_COMPLETE",
    data: { remaining: queue.size, failed: failedItems.length },
  });
}
