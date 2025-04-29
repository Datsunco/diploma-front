import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setOnlineStatus, setLastSyncTime } from '@/store/slices/networkSlice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';
import { getPendingActions } from '@/lib/db';


interface SyncRegistration extends ServiceWorkerRegistration {
  sync: {
    register(tag: string): Promise<void>;
  };
}


const NetworkStatus: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOnline, pendingActions } = useAppSelector(state => state.network);
  const [localPendingCount, setLocalPendingCount] = useState(0);

  // Обработчики изменения статуса сети
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      
      // Если есть отложенные действия, запускаем синхронизацию
      if (pendingActions.length > 0) {
        syncPendingActions();
      }
    };

    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
    };

    // Синхронизация отложенных действий при восстановлении соединения
    const syncPendingActions = async () => {
      // Если браузер поддерживает Background Sync API
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as SyncRegistration).sync.register('sync-pending-actions');
      } else {
        // Ручная синхронизация
        const actions = await getPendingActions();
        // Здесь логика для выполнения отложенных действий
        // ...
      }
      
      // После успешной синхронизации обновляем время последней синхронизации
      dispatch(setLastSyncTime(new Date().toISOString()));
    };

    // Загрузка отложенных действий из IndexedDB
    const loadPendingActions = async () => {
      const actions = await getPendingActions();
      setLocalPendingCount(actions.length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Загружаем отложенные действия при монтировании компонента
    loadPendingActions();
    
    // Периодически проверяем наличие отложенных действий
    const interval = setInterval(loadPendingActions, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [dispatch, pendingActions]);

  // Ручная синхронизация
  const handleManualSync = async () => {
    if (isOnline) {
      try {
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          await (registration as SyncRegistration).sync.register('sync-pending-actions');
        } else {
          const actions = await getPendingActions();
          // Здесь логика для выполнения отложенных действий
          // ...
        }
        
        dispatch(setLastSyncTime(new Date().toISOString()));
      } catch (error) {
        console.error('Manual sync failed:', error);
      }
    }
  };

  // Не отображаем ничего, если соединение активно и нет отложенных действий
  if (isOnline && localPendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert variant={isOnline ? "default" : "destructive"} className="w-72">
        {isOnline ? <RefreshCw className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <AlertTitle>{isOnline ? "Syncing Data" : "Offline Mode"}</AlertTitle>
        <AlertDescription>
          {isOnline 
            ? `Syncing ${localPendingCount} pending ${localPendingCount === 1 ? 'action' : 'actions'}...` 
            : `You are currently offline. Some features may be limited.`}
          {localPendingCount > 0 && !isOnline && (
            <div className="mt-2 text-sm">
              {localPendingCount} {localPendingCount === 1 ? 'action' : 'actions'} pending synchronization.
            </div>
          )}
          {isOnline && localPendingCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2" 
              onClick={handleManualSync}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Sync Now
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NetworkStatus;