/**
 * IndexedDB Database Layer
 * Provides offline-first storage capabilities
 */

export interface DBConfig {
  dbName: string;
  version: number;
  stores: {
    [storeName: string]: {
      keyPath?: string;
      autoIncrement?: boolean;
      indexes?: Array<{
        name: string;
        keyPath: string | string[];
        unique?: boolean;
      }>;
    };
  };
}

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private config: DBConfig;

  constructor(config: DBConfig) {
    this.config = config;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.dbName, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        Object.entries(this.config.stores).forEach(([storeName, storeConfig]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: storeConfig.keyPath || "id",
              autoIncrement: storeConfig.autoIncrement || false,
            });

            storeConfig.indexes?.forEach((index) => {
              store.createIndex(
                index.name,
                index.keyPath,
                { unique: index.unique || false }
              );
            });
          }
        });
      };
    });
  }

  private getDB(): IDBDatabase {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return this.db;
  }

  async add<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async put<T>(storeName: string, data: T): Promise<IDBValidKey> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll<T>(storeName: string, query?: IDBValidKey | IDBKeyRange): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAll(query);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllFromIndex<T>(
    storeName: string,
    indexName: string,
    query?: IDBValidKey | IDBKeyRange
  ): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(query);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async count(storeName: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async transaction<T>(
    storeNames: string[],
    callback: (stores: Record<string, IDBObjectStore>) => Promise<T>
  ): Promise<T> {
    const db = this.getDB();
    const trans = db.transaction(storeNames, "readwrite");

    const stores: Record<string, IDBObjectStore> = {};
    storeNames.forEach((name) => {
      stores[name] = trans.objectStore(name);
    });

    return new Promise((resolve, reject) => {
      trans.onerror = () => reject(trans.error);
      trans.oncomplete = () => resolve;
      callback(stores).then(resolve).catch(reject);
    });
  }

  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Initialize database with FCS schema
export const dbConfig: DBConfig = {
  dbName: "fcs-registration",
  version: 1,
  stores: {
    users: {
      keyPath: "id",
    },
    events: {
      keyPath: "id",
      indexes: [{ name: "unitId", keyPath: "unitId" }],
    },
    registrations: {
      keyPath: "id",
      indexes: [
        { name: "eventId", keyPath: "eventId" },
        { name: "userId", keyPath: "userId" },
      ],
    },
    attendance: {
      keyPath: "id",
      indexes: [
        { name: "eventId", keyPath: "eventId" },
        { name: "userId", keyPath: "userId" },
      ],
    },
    offlineQueue: {
      keyPath: "id",
      autoIncrement: true,
      indexes: [{ name: "status", keyPath: "status" }],
    },
    syncMetadata: {
      keyPath: "key",
    },
  },
};

// Create singleton instance
let dbManager: IndexedDBManager | null = null;

export async function getDB(): Promise<IndexedDBManager> {
  if (!dbManager) {
    dbManager = new IndexedDBManager(dbConfig);
    await dbManager.init();
  }
  return dbManager;
}
