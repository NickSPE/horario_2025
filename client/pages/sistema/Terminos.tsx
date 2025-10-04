import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, Calendar } from "lucide-react";

export default function Terminos() {
  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <ScrollText className="h-4 w-4 mr-2" />
              Legal
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Términos y Condiciones
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Última actualización: Octubre 2025</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <section className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>1. Aceptación de los Términos</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>
                Al acceder y usar Horario Médico ("el Servicio"), aceptas estar sujeto a estos Términos y Condiciones. 
                Si no estás de acuerdo con alguna parte de estos términos, no debes usar el Servicio.
              </p>
              <p>
                El Servicio está diseñado para ayudar en la gestión de recordatorios de medicamentos, 
                pero no sustituye el consejo, diagnóstico o tratamiento médico profesional.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Uso del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <h4 className="font-semibold text-base md:text-lg mt-4">2.1 Elegibilidad</h4>
              <p>
                Debes tener al menos 18 años para usar el Servicio. Si eres menor de edad, 
                debes contar con el consentimiento de un padre o tutor legal.
              </p>

              <h4 className="font-semibold text-base md:text-lg mt-4">2.2 Cuenta de Usuario</h4>
              <ul className="space-y-2">
                <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
                <li>Debes proporcionar información precisa y actualizada</li>
                <li>No debes compartir tu cuenta con terceros</li>
                <li>Debes notificarnos inmediatamente de cualquier uso no autorizado</li>
              </ul>

              <h4 className="font-semibold text-base md:text-lg mt-4">2.3 Uso Aceptable</h4>
              <p>Te comprometes a NO:</p>
              <ul className="space-y-2">
                <li>Usar el Servicio para fines ilegales o no autorizados</li>
                <li>Intentar obtener acceso no autorizado al sistema</li>
                <li>Interferir con el funcionamiento del Servicio</li>
                <li>Transmitir malware, virus o código malicioso</li>
                <li>Suplantar la identidad de otra persona</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Responsabilidad Médica</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <div className="bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500 p-4 rounded">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  ⚠️ IMPORTANTE: Este servicio NO es un sustituto de la atención médica profesional.
                </p>
              </div>
              <ul className="space-y-2 mt-4">
                <li>
                  <strong>No proporcionamos consejo médico:</strong> Toda la información es solo de referencia. 
                  Consulta siempre a tu médico para decisiones sobre tu tratamiento.
                </li>
                <li>
                  <strong>No garantizamos resultados:</strong> El Servicio es una herramienta de apoyo. 
                  Tú eres responsable de seguir las indicaciones de tu médico.
                </li>
                <li>
                  <strong>Emergencias médicas:</strong> En caso de emergencia, llama al servicio de emergencias local (911). 
                  NO uses el Servicio para situaciones urgentes.
                </li>
                <li>
                  <strong>Verificación de información:</strong> Verifica siempre con tu médico o farmacéutico 
                  la información sobre medicamentos, dosis e interacciones.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Para Profesionales de la Salud</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <h4 className="font-semibold text-base md:text-lg">4.1 Licencia Profesional</h4>
              <p>
                Al registrarte como profesional, declaras que posees las licencias, 
                certificaciones y autorizaciones necesarias para ejercer tu profesión.
              </p>

              <h4 className="font-semibold text-base md:text-lg mt-4">4.2 Responsabilidad Profesional</h4>
              <ul className="space-y-2">
                <li>Eres responsable de la información médica que proporcionas a tus pacientes</li>
                <li>Debes cumplir con las normativas de tu jurisdicción</li>
                <li>La asignación de recordatorios no sustituye la consulta médica presencial</li>
                <li>Debes mantener la confidencialidad de la información de tus pacientes</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Privacidad y Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>
                El tratamiento de tus datos personales está regulado por nuestra{" "}
                <a href="/privacidad" className="text-primary hover:underline font-semibold">
                  Política de Privacidad
                </a>.
              </p>
              <p>Al usar el Servicio, consientes:</p>
              <ul className="space-y-2">
                <li>La recopilación y procesamiento de tus datos según la Política de Privacidad</li>
                <li>El almacenamiento seguro de tu información médica</li>
                <li>El acceso de profesionales asignados a tu información de recordatorios</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Propiedad Intelectual</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>
                Todo el contenido del Servicio (código, diseño, textos, gráficos, logos) 
                es propiedad de Horario Médico o sus licenciantes y está protegido por 
                leyes de propiedad intelectual.
              </p>
              <p>No está permitido:</p>
              <ul className="space-y-2">
                <li>Copiar, modificar o distribuir el contenido sin autorización</li>
                <li>Realizar ingeniería inversa del software</li>
                <li>Usar nuestras marcas comerciales sin permiso</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitación de Responsabilidad</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>
                El Servicio se proporciona "tal cual" sin garantías de ningún tipo. 
                En la máxima medida permitida por la ley:
              </p>
              <ul className="space-y-2">
                <li>
                  <strong>No garantizamos disponibilidad continua:</strong> Puede haber interrupciones 
                  por mantenimiento, fallas técnicas o causas fuera de nuestro control.
                </li>
                <li>
                  <strong>No somos responsables por:</strong>
                  <ul className="ml-6 mt-2 space-y-1">
                    <li>Pérdida de datos</li>
                    <li>Daños indirectos o consecuenciales</li>
                    <li>Decisiones médicas tomadas basándose en el Servicio</li>
                    <li>Errores u omisiones en la información</li>
                  </ul>
                </li>
                <li>
                  <strong>Indemnización:</strong> Aceptas indemnizarnos por reclamaciones derivadas de tu uso del Servicio.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Modificaciones del Servicio</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>Nos reservamos el derecho de:</p>
              <ul className="space-y-2">
                <li>Modificar o descontinuar el Servicio en cualquier momento</li>
                <li>Actualizar estos Términos (te notificaremos cambios importantes)</li>
                <li>Cambiar o eliminar funcionalidades</li>
                <li>Suspender o cancelar cuentas que violen estos términos</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Terminación</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <h4 className="font-semibold text-base md:text-lg">9.1 Por el Usuario</h4>
              <p>Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil.</p>

              <h4 className="font-semibold text-base md:text-lg mt-4">9.2 Por Horario Médico</h4>
              <p>Podemos suspender o terminar tu acceso si:</p>
              <ul className="space-y-2">
                <li>Violas estos Términos</li>
                <li>Usas el Servicio de manera fraudulenta o ilegal</li>
                <li>Tu cuenta está inactiva por más de 12 meses</li>
              </ul>

              <h4 className="font-semibold text-base md:text-lg mt-4">9.3 Efectos de la Terminación</h4>
              <p>
                Al terminar tu cuenta, perderás acceso a tus datos. Podemos retener 
                cierta información según lo requerido por ley.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Ley Aplicable y Jurisdicción</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>
                Estos Términos se rigen por las leyes aplicables de tu jurisdicción. 
                Cualquier disputa se resolverá en los tribunales competentes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Contacto</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>Para preguntas sobre estos Términos, contáctanos en:</p>
              <ul className="space-y-2">
                <li>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:legal@horariomedico.com" className="text-primary hover:underline">
                    legal@horariomedico.com
                  </a>
                </li>
                <li>
                  <strong>Formulario de contacto:</strong>{" "}
                  <a href="/contacto" className="text-primary hover:underline">
                    /contacto
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="bg-muted/50 border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Al usar Horario Médico, confirmas que has leído, comprendido y aceptado estos Términos y Condiciones.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Última actualización: Octubre 4, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Espaciado para barra móvil */}
      <div className="md:hidden h-20" />
    </div>
  );
}
