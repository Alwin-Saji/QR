import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getQueue, removeFromQueue, getQueueCount } from '../services/offlineQueue';
import { uploadPhoto } from '../services/storage';

const SyncContext = createContext();

export function SyncProvider({ children }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const updateQueueCount = useCallback(async () => {
    try {
      const count = await getQueueCount();
      setQueueCount(count);
    } catch (e) {
      console.error("Could not read offline queue count", e);
    }
  }, []);

  const syncQueue = useCallback(async () => {
    if (!navigator.onLine || syncing) return;
    
    setSyncing(true);
    try {
      const queue = await getQueue();
      for (const item of queue) {
        try {
          // Pass preventRequeue: true to avoid duplicating in case of another network failure mid-sync
          await uploadPhoto(item.eventId, item.file, item.uploader, { preventRequeue: true });
          await removeFromQueue(item.id);
        } catch (error) {
          console.error("Failed to sync item", item.id, error);
          if (error.message === 'Failed to fetch' || !navigator.onLine) {
            // Network dropped again, stop syncing.
            break;
          }
        }
      }
    } catch (err) {
      console.error("Sync process failed", err);
    } finally {
      await updateQueueCount();
      setSyncing(false);
    }
  }, [syncing, updateQueueCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updateQueueCount();
    if (navigator.onLine) {
      syncQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueue, updateQueueCount]);

  // Expose a trigger so components can manually tell the context to update the count
  // (e.g., right after CameraCapture successfully queues a photo)
  const notifyItemQueued = useCallback(() => {
    updateQueueCount();
  }, [updateQueueCount]);

  return (
    <SyncContext.Provider value={{ isOnline, queueCount, syncing, syncQueue, notifyItemQueued }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  return useContext(SyncContext);
}
