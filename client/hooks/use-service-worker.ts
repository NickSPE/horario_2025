// Hook para registrar y manejar el Service Worker

import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [serviceWorkerRegistered, setServiceWorkerRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      console.log('Service Worker registrado:', registration);
      setServiceWorkerRegistered(true);

      // Verificar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });

      // Configurar sincronización periódica (si está soportado)
      if ('periodicSync' in registration) {
        try {
          await (registration as any).periodicSync.register('check-recordatorios', {
            minInterval: 60 * 1000 // Cada 1 minuto
          });
          console.log('Sincronización periódica registrada');
        } catch (error) {
          console.log('Sincronización periódica no soportada:', error);
        }
      }

      return registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      return null;
    }
  }

  async function scheduleNotification(
    recordatorioId: string,
    medicamento: string,
    dosis: string,
    timestamp: number
  ) {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Workers no soportados');
      return false;
    }

    const registration = await navigator.serviceWorker.ready;

    // Guardar en IndexedDB para que el Service Worker lo encuentre
    await saveRecordatorioLocal({
      id: recordatorioId,
      medicamento_nombre: medicamento,
      dosis_a_tomar: dosis,
      proxima_toma: new Date(timestamp).toISOString(),
      activo: true
    });

    console.log('Notificación programada para:', new Date(timestamp));
    return true;
  }

  async function saveRecordatorioLocal(recordatorio: any) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RecordatoriosDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['recordatorios'], 'readwrite');
        const store = transaction.objectStore('recordatorios');
        const addRequest = store.put(recordatorio);
        
        addRequest.onsuccess = () => resolve(addRequest.result);
        addRequest.onerror = () => reject(addRequest.error);
      };
      
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('recordatorios')) {
          db.createObjectStore('recordatorios', { keyPath: 'id' });
        }
      };
    });
  }

  async function clearRecordatorioLocal(recordatorioId: string) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RecordatoriosDB', 1);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['recordatorios'], 'readwrite');
        const store = transaction.objectStore('recordatorios');
        const deleteRequest = store.delete(recordatorioId);
        
        deleteRequest.onsuccess = () => resolve(deleteRequest.result);
        deleteRequest.onerror = () => reject(deleteRequest.error);
      };
    });
  }

  return {
    serviceWorkerRegistered,
    updateAvailable,
    scheduleNotification,
    saveRecordatorioLocal,
    clearRecordatorioLocal
  };
}
