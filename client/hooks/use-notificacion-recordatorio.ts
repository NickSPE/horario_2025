// Hook personalizado para notificaciones y sonidos de recordatorios

export function useNotificacionRecordatorio() {
  // Solicitar permiso para notificaciones
  const solicitarPermisoNotificaciones = async () => {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // Reproducir sonido de alarma
  const reproducirAlarma = () => {
    // Crear un sonido de alarma con Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar sonido de alarma (beep beep beep)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frecuencia alta
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Volumen medio

    // Patrón: beep-pausa-beep-pausa-beep
    const beepDuration = 0.2;
    const pauseDuration = 0.15;

    oscillator.start(audioContext.currentTime);
    
    // Primer beep
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + beepDuration);
    
    // Segundo beep
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + beepDuration + pauseDuration);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + (beepDuration * 2) + pauseDuration);
    
    // Tercer beep
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + (beepDuration * 2) + (pauseDuration * 2));
    gainNode.gain.setValueAtTime(0, audioContext.currentTime + (beepDuration * 3) + (pauseDuration * 2));

    oscillator.stop(audioContext.currentTime + (beepDuration * 3) + (pauseDuration * 2) + 0.1);
  };

  // Vibrar el dispositivo (móviles)
  const vibrar = () => {
    if ('vibrate' in navigator) {
      // Patrón: vibrar-pausa-vibrar-pausa-vibrar
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  };

  // Mostrar notificación del navegador
  const mostrarNotificacion = async (medicamento: string, dosis: string) => {
    const tienePermiso = await solicitarPermisoNotificaciones();
    
    if (!tienePermiso) {
      console.log('No hay permiso para notificaciones');
      return;
    }

    const notification = new Notification('⏰ ¡Hora de tomar tu medicamento!', {
      body: `${medicamento}\nDosis: ${dosis}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'recordatorio-medicamento',
      requireInteraction: true, // La notificación no se cierra automáticamente
      data: {
        medicamento,
        dosis
      }
    } as NotificationOptions);

    // Opcional: hacer algo cuando el usuario hace clic en la notificación
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  };

  // Alarma completa: sonido + vibración + notificación
  const alarmaCompleta = async (medicamento: string, dosis: string) => {
    // 1. Reproducir sonido
    reproducirAlarma();
    
    // 2. Vibrar (móviles)
    vibrar();
    
    // 3. Mostrar notificación
    await mostrarNotificacion(medicamento, dosis);
  };

  return {
    solicitarPermisoNotificaciones,
    reproducirAlarma,
    vibrar,
    mostrarNotificacion,
    alarmaCompleta
  };
}
