// Service Worker para notificaciones en background
// Este archivo permite que las notificaciones funcionen aunque el navegador esté cerrado

const CACHE_NAME = 'recordatorios-v1';
const URLS_TO_CACHE = [
  '/',
  '/favicon.ico'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierto');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activado');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache viejo');
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// IMPORTANTE: Escuchar notificaciones programadas
self.addEventListener('notificationclick', (event) => {
  console.log('Notificación clickeada:', event.notification.tag);
  event.notification.close();

  // Abrir la app cuando hacen clic en la notificación
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Mostrar notificación desde el Service Worker
self.addEventListener('push', (event) => {
  console.log('Push recibido:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || '⏰ ¡Hora de tomar tu medicamento!';
  const options = {
    body: data.body || 'Es hora de tomar tu medicamento',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'recordatorio-medicamento',
    requireInteraction: true,
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('Background sync:', event.tag);
  
  if (event.tag === 'sync-recordatorios') {
    event.waitUntil(
      // Aquí puedes sincronizar con Supabase
      fetch('/api/sync-recordatorios')
        .then(response => response.json())
        .then(data => console.log('Recordatorios sincronizados:', data))
        .catch(err => console.error('Error sincronizando:', err))
    );
  }
});

// Verificar recordatorios periódicamente (cuando el navegador está cerrado)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-recordatorios') {
    event.waitUntil(
      checkRecordatoriosPendientes()
    );
  }
});

async function checkRecordatoriosPendientes() {
  try {
    // Obtener recordatorios desde IndexedDB o localStorage
    const recordatorios = await getRecordatoriosLocales();
    const ahora = new Date();

    recordatorios.forEach(async (recordatorio) => {
      const proximaToma = new Date(recordatorio.proxima_toma);
      
      if (proximaToma <= ahora && recordatorio.activo) {
        // Mostrar notificación
        await self.registration.showNotification('⏰ ¡Hora de tomar tu medicamento!', {
          body: `${recordatorio.medicamento_nombre}\nDosis: ${recordatorio.dosis_a_tomar}`,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          vibrate: [200, 100, 200, 100, 200],
          tag: `recordatorio-${recordatorio.id}`,
          requireInteraction: true,
          actions: [
            {
              action: 'tomar',
              title: '✓ Marcar como tomado'
            },
            {
              action: 'posponer',
              title: '⏰ Posponer 10 min'
            }
          ],
          data: recordatorio
        });
      }
    });
  } catch (error) {
    console.error('Error verificando recordatorios:', error);
  }
}

async function getRecordatoriosLocales() {
  // Intentar obtener de IndexedDB o localStorage
  try {
    const db = await openDB();
    return await db.getAll('recordatorios');
  } catch {
    return [];
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RecordatoriosDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('recordatorios')) {
        db.createObjectStore('recordatorios', { keyPath: 'id' });
      }
    };
  });
}
