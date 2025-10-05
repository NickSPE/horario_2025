// Hook personalizado para notificaciones y sonidos de recordatorios
import type { TipoSonido } from '@shared/recordatorios';
import { CONFIGURACION_ALARMA } from '@shared/recordatorios';
import { useRef, useCallback } from 'react';

export function useNotificacionRecordatorio() {
  // Referencias para controlar la alarma activa
  const alarmaIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

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

  // Reproducir sonido de alarma según el tipo seleccionado
  const reproducirAlarma = useCallback((tipoSonido: TipoSonido = 'beep', audioUrl?: string) => {
    // DESACTIVADO TEMPORALMENTE: Audio personalizado
    /*
    if (tipoSonido === 'personalizado' && audioUrl) {
      const audio = new Audio(audioUrl);
      audio.loop = false;
      audio.volume = 0.8;
      audio.play().catch(err => console.error('Error al reproducir audio personalizado:', err));
      audioElementRef.current = audio;
      return;
    }
    */

    // Usar Web Audio API para sonidos predefinidos
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const currentTime = audioContext.currentTime;

    switch (tipoSonido) {
      case 'beep': // Beep clásico - tres tonos cortos
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, currentTime);
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.setValueAtTime(0, currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, currentTime + 0.35);
        gainNode.gain.setValueAtTime(0, currentTime + 0.55);
        gainNode.gain.setValueAtTime(0.3, currentTime + 0.7);
        gainNode.gain.setValueAtTime(0, currentTime + 0.9);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 1);
        break;

      case 'suave': // Tono melodioso ascendente
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 1);
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.9);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 1.2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 1.2);
        break;

      case 'urgente': // Alarma insistente con vibrato
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(900, currentTime);
        gainNode.gain.setValueAtTime(0.4, currentTime);
        // Patrón rápido y repetitivo
        for (let i = 0; i < 6; i++) {
          gainNode.gain.setValueAtTime(0.4, currentTime + i * 0.15);
          gainNode.gain.setValueAtTime(0, currentTime + i * 0.15 + 0.08);
        }
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 1);
        break;

      case 'campana': // Sonido de campana con reverberación
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(1000, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.5, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 1.5);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 1.5);
        break;

      case 'digital': // Bips electrónicos modernos
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(600, currentTime);
        gainNode.gain.setValueAtTime(0.3, currentTime);
        // Dos tonos rápidos
        oscillator.frequency.setValueAtTime(600, currentTime);
        oscillator.frequency.setValueAtTime(800, currentTime + 0.1);
        gainNode.gain.setValueAtTime(0, currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, currentTime + 0.2);
        oscillator.frequency.setValueAtTime(600, currentTime + 0.2);
        oscillator.frequency.setValueAtTime(800, currentTime + 0.3);
        gainNode.gain.setValueAtTime(0, currentTime + 0.35);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.4);
        break;
    }
  }, []);

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

  // Alarma completa: sonido + vibración + notificación (repite durante 30 segundos)
  const alarmaCompleta = useCallback(async (
    medicamento: string, 
    dosis: string, 
    tipoSonido: TipoSonido = 'beep',
    audioUrl?: string
  ) => {
    // Limpiar cualquier alarma anterior
    detenerAlarma();

    // 1. Vibrar (móviles)
    vibrar();
    
    // 2. Mostrar notificación
    await mostrarNotificacion(medicamento, dosis);
    
    // 3. Reproducir sonido inicial
    reproducirAlarma(tipoSonido, audioUrl);
    
    // 4. Repetir el sonido cada 3 segundos durante 30 segundos
    let repeticiones = 0;
    const maxRepeticiones = Math.floor(CONFIGURACION_ALARMA.DURACION_ALARMA_SEGUNDOS / 3);
    
    alarmaIntervalRef.current = setInterval(() => {
      repeticiones++;
      if (repeticiones >= maxRepeticiones) {
        detenerAlarma();
      } else {
        reproducirAlarma(tipoSonido, audioUrl);
        if (repeticiones % 3 === 0) {
          vibrar(); // Vibrar cada 9 segundos
        }
      }
    }, 3000); // Repetir cada 3 segundos
  }, [reproducirAlarma]);

  // Detener alarma manualmente
  const detenerAlarma = useCallback(() => {
    if (alarmaIntervalRef.current) {
      clearInterval(alarmaIntervalRef.current);
      alarmaIntervalRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
  }, []);

  return {
    solicitarPermisoNotificaciones,
    reproducirAlarma,
    vibrar,
    mostrarNotificacion,
    alarmaCompleta,
    detenerAlarma,
  };
}
