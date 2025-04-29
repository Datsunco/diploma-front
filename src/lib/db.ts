import { openDB, DBSchema } from "idb";

interface SyncRegistration extends ServiceWorkerRegistration {
  sync: {
    register(tag: string): Promise<void>;
  };
}

interface TaskManagerDB extends DBSchema {
  tasks: {
    key: string;
    value: any; // Тип Task
  };
  teams: {
    key: string;
    value: any; // Тип Team
  };
  "pending-actions": {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      headers: Record<string, string>;
      body: string;
      timestamp: number;
    };
  };
}

export const initDB = async () => {
  return openDB<TaskManagerDB>("task-manager-db", 1, {
    upgrade(db) {
      // Создание хранилищ
      if (!db.objectStoreNames.contains("tasks")) {
        db.createObjectStore("tasks", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("teams")) {
        db.createObjectStore("teams", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("pending-actions")) {
        db.createObjectStore("pending-actions", { keyPath: "id" });
      }
    },
  });
};

// Функция для сохранения действия, которое нужно выполнить при восстановлении соединения
export const savePendingAction = async (action: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
}) => {
  const db = await initDB();
  const id = Date.now().toString();

  await db.add("pending-actions", {
    id,
    ...action,
    timestamp: Date.now(),
  });

  // Запрос на синхронизацию, если браузер поддерживает Background Sync API
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    const registration = await navigator.serviceWorker.ready;
    await (registration as SyncRegistration).sync.register(
      "sync-pending-actions"
    );
  }

  return id;
};

// Функция для получения всех отложенных действий
export const getPendingActions = async () => {
  const db = await initDB();
  return db.getAll("pending-actions");
};

// Функция для удаления отложенного действия
export const deletePendingAction = async (id: string) => {
  const db = await initDB();
  return db.delete("pending-actions", id);
};
