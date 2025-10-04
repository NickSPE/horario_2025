import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Lock, Eye, Database, UserCheck } from "lucide-react";

export default function Privacidad() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Privacidad y Seguridad
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Política de Privacidad
            </h1>
            <p className="text-lg text-muted-foreground">
              Tu información médica está protegida con los más altos estándares de seguridad
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Última actualización: Octubre 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Resumen Ejecutivo */}
      <section className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-bold mb-4">En Resumen</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Encriptación total</p>
                  <p className="text-sm text-muted-foreground">Toda tu información está cifrada</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Control total</p>
                  <p className="text-sm text-muted-foreground">Tú decides quién ve tus datos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Eye className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Sin publicidad</p>
                  <p className="text-sm text-muted-foreground">Nunca vendemos tus datos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Respaldos diarios</p>
                  <p className="text-sm text-muted-foreground">Tu información siempre segura</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>1. Información que Recopilamos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <h4 className="font-semibold text-base md:text-lg">1.1 Información de Cuenta</h4>
                <ul className="space-y-2">
                  <li><strong>Datos básicos:</strong> Nombre, apellido, email, DNI</li>
                  <li><strong>Credenciales:</strong> Contraseña (hasheada, nunca almacenada en texto plano)</li>
                  <li><strong>Tipo de usuario:</strong> Paciente o Profesional de la salud</li>
                  <li><strong>Para profesionales:</strong> Licencia profesional, especialidad</li>
                </ul>

                <h4 className="font-semibold text-base md:text-lg mt-4">1.2 Información Médica</h4>
                <ul className="space-y-2">
                  <li><strong>Recordatorios:</strong> Medicamentos, dosis, horarios, frecuencia</li>
                  <li><strong>Historial:</strong> Registro de tomas completadas con hora exacta</li>
                  <li><strong>Notas:</strong> Indicaciones adicionales proporcionadas por profesionales</li>
                  <li><strong>Progreso:</strong> Tomas completadas, adherencia calculada</li>
                </ul>

                <h4 className="font-semibold text-base md:text-lg mt-4">1.3 Información Técnica</h4>
                <ul className="space-y-2">
                  <li><strong>Logs de acceso:</strong> Fecha y hora de inicio de sesión</li>
                  <li><strong>Dispositivo:</strong> Tipo de navegador, sistema operativo</li>
                  <li><strong>IP:</strong> Dirección IP para seguridad (no para rastreo)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>2. Cómo Usamos tu Información</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <p>Usamos tu información ÚNICAMENTE para:</p>
                <ul className="space-y-2">
                  <li>
                    <strong>Proporcionar el servicio:</strong> Enviar notificaciones, calcular horarios, 
                    mostrar recordatorios
                  </li>
                  <li>
                    <strong>Seguridad:</strong> Autenticación, prevención de fraude, detección de accesos no autorizados
                  </li>
                  <li>
                    <strong>Mejoras:</strong> Optimizar funcionalidades, corregir errores técnicos
                  </li>
                  <li>
                    <strong>Comunicación:</strong> Notificaciones importantes sobre el servicio, 
                    cambios en políticas (nunca marketing no solicitado)
                  </li>
                </ul>

                <div className="bg-green-50 dark:bg-green-950 border-l-4 border-green-500 p-4 rounded mt-4">
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    ✓ NUNCA vendemos, alquilamos o compartimos tus datos con terceros para publicidad
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>3. Compartir Información</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <h4 className="font-semibold text-base md:text-lg">3.1 Con Profesionales Asignados</h4>
                <p>
                  Si eres paciente y un profesional de la salud te asigna un recordatorio, 
                  ese profesional puede ver:
                </p>
                <ul className="space-y-2">
                  <li>Tus recordatorios activos</li>
                  <li>Progreso de tomas (completadas vs pendientes)</li>
                  <li>Última toma y próxima programada</li>
                  <li>Porcentaje de adherencia</li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  <strong>Importante:</strong> Solo ven información de recordatorios que ellos crearon. 
                  No tienen acceso a recordatorios que tú creaste por tu cuenta.
                </p>

                <h4 className="font-semibold text-base md:text-lg mt-4">3.2 Proveedores de Servicios</h4>
                <ul className="space-y-2">
                  <li>
                    <strong>Supabase:</strong> Hosting de base de datos (certificado SOC 2, HIPAA-compliant)
                  </li>
                  <li>
                    <strong>Service Workers:</strong> Almacenamiento local en tu dispositivo para notificaciones offline
                  </li>
                </ul>

                <h4 className="font-semibold text-base md:text-lg mt-4">3.3 Requerimientos Legales</h4>
                <p>
                  Podemos divulgar información si es requerido por ley, orden judicial, 
                  o para proteger derechos, seguridad o propiedad.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>4. Seguridad de los Datos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <h4 className="font-semibold text-base md:text-lg">4.1 Medidas Técnicas</h4>
                <ul className="space-y-2">
                  <li>
                    <strong>Encriptación en tránsito:</strong> HTTPS/TLS para todas las comunicaciones
                  </li>
                  <li>
                    <strong>Encriptación en reposo:</strong> Base de datos cifrada (AES-256)
                  </li>
                  <li>
                    <strong>Contraseñas:</strong> Hasheadas con bcrypt (nunca almacenadas en texto plano)
                  </li>
                  <li>
                    <strong>RLS (Row Level Security):</strong> Control de acceso a nivel de fila en base de datos
                  </li>
                </ul>

                <h4 className="font-semibold text-base md:text-lg mt-4">4.2 Medidas Organizacionales</h4>
                <ul className="space-y-2">
                  <li>Acceso limitado a datos solo por personal autorizado</li>
                  <li>Auditorías regulares de seguridad</li>
                  <li>Respaldos automáticos diarios</li>
                  <li>Monitoreo de accesos sospechosos</li>
                </ul>

                <h4 className="font-semibold text-base md:text-lg mt-4">4.3 Tu Responsabilidad</h4>
                <ul className="space-y-2">
                  <li>Mantén tu contraseña segura y privada</li>
                  <li>No compartas tu cuenta</li>
                  <li>Cierra sesión en dispositivos compartidos</li>
                  <li>Notifícanos inmediatamente si sospechas acceso no autorizado</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>5. Tus Derechos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <p>Tienes derecho a:</p>
                <ul className="space-y-2">
                  <li>
                    <strong>Acceso:</strong> Ver toda la información que tenemos sobre ti
                  </li>
                  <li>
                    <strong>Rectificación:</strong> Corregir datos incorrectos o incompletos
                  </li>
                  <li>
                    <strong>Eliminación:</strong> Borrar tu cuenta y toda tu información (derecho al olvido)
                  </li>
                  <li>
                    <strong>Portabilidad:</strong> Exportar tus datos en formato estructurado
                  </li>
                  <li>
                    <strong>Objeción:</strong> Oponerte al procesamiento de ciertos datos
                  </li>
                  <li>
                    <strong>Revocación:</strong> Retirar consentimiento en cualquier momento
                  </li>
                </ul>

                <p className="mt-4">
                  Para ejercer estos derechos, contáctanos en{" "}
                  <a href="mailto:privacidad@horariomedico.com" className="text-primary hover:underline font-semibold">
                    privacidad@horariomedico.com
                  </a>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>6. Retención de Datos</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <ul className="space-y-2">
                  <li>
                    <strong>Cuenta activa:</strong> Mientras uses el servicio
                  </li>
                  <li>
                    <strong>Cuenta inactiva:</strong> 12 meses de inactividad, luego eliminación automática
                  </li>
                  <li>
                    <strong>Después de eliminar cuenta:</strong> 30 días para recuperación, luego borrado permanente
                  </li>
                  <li>
                    <strong>Logs de seguridad:</strong> 90 días para investigación de incidentes
                  </li>
                  <li>
                    <strong>Información legal:</strong> El tiempo requerido por ley (ej. registros fiscales)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>7. Cookies y Tecnologías Similares</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <h4 className="font-semibold text-base md:text-lg">Cookies Esenciales</h4>
                <ul className="space-y-2">
                  <li><strong>Autenticación:</strong> Mantener tu sesión activa</li>
                  <li><strong>Seguridad:</strong> Prevenir ataques CSRF</li>
                  <li><strong>Preferencias:</strong> Recordar tema oscuro/claro</li>
                </ul>

                <h4 className="font-semibold text-base md:text-lg mt-4">Service Workers</h4>
                <p>
                  Usamos Service Workers para habilitar notificaciones offline. 
                  Esto almacena datos localmente en tu dispositivo, controlados por ti.
                </p>

                <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-4 rounded mt-4">
                  <p className="text-blue-900 dark:text-blue-100">
                    ℹ️ NO usamos cookies de terceros, publicidad o rastreo de comportamiento
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>8. Menores de Edad</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <p>
                  El Servicio no está dirigido a menores de 18 años sin consentimiento parental. 
                  Si descubrimos que hemos recopilado información de un menor sin consentimiento, 
                  la eliminaremos inmediatamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>9. Cambios a esta Política</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <p>
                  Podemos actualizar esta Política de Privacidad. Los cambios importantes 
                  se notificarán por email o mediante un aviso destacado en el Servicio.
                </p>
                <p>
                  La "Última actualización" al inicio indica cuándo se modificó por última vez.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>10. Contacto</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                <p>Para preguntas sobre privacidad o ejercer tus derechos:</p>
                <ul className="space-y-2">
                  <li>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:privacidad@horariomedico.com" className="text-primary hover:underline">
                      privacidad@horariomedico.com
                    </a>
                  </li>
                  <li>
                    <strong>Formulario:</strong>{" "}
                    <a href="/contacto" className="text-primary hover:underline">
                      /contacto
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <div className="bg-muted/50 border rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Al usar Horario Médico, consientes el procesamiento de tus datos según esta Política de Privacidad.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Última actualización: Octubre 4, 2025
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Espaciado para barra móvil */}
      <div className="md:hidden h-20" />
    </div>
  );
}
