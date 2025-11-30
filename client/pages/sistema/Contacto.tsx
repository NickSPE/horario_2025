import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send
} from "lucide-react";
import { useState } from "react";

export default function Contacto() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    asunto: "",
    mensaje: ""
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre || !formData.email || !formData.asunto || !formData.mensaje) {
      toast({
        variant: "destructive",
        title: "Campos incompletos",
        description: "Por favor completa todos los campos"
      });
      return;
    }

    setEnviando(true);

    // Simulación de envío (aquí integrarías con tu backend o servicio de email)
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
      toast({
        title: "✓ Mensaje enviado",
        description: "Te responderemos en menos de 24 horas"
      });
      
      // Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        asunto: "",
        mensaje: ""
      });

      // Resetear estado de enviado después de 5 segundos
      setTimeout(() => setEnviado(false), 5000);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <MessageSquare className="h-4 w-4 mr-2" />
              Estamos aquí para ayudarte
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Contáctanos
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              ¿Tienes preguntas o necesitas ayuda? Escríbenos y te responderemos pronto
            </p>
          </div>
        </div>
      </section>

      {/* Contenido Principal */}
      <section className="container py-12 md:py-20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div>
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Envíanos un mensaje</CardTitle>
                <CardDescription>
                  Completa el formulario y te responderemos en menos de 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enviado && (
                  <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-100">
                      <strong>¡Mensaje enviado con éxito!</strong> Te responderemos pronto.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="nombre" className="text-sm font-medium">
                      Nombre completo *
                    </label>
                    <Input
                      id="nombre"
                      name="nombre"
                      placeholder="Juan Pérez"
                      value={formData.nombre}
                      onChange={handleChange}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="asunto" className="text-sm font-medium">
                      Asunto *
                    </label>
                    <Input
                      id="asunto"
                      name="asunto"
                      placeholder="¿En qué podemos ayudarte?"
                      value={formData.asunto}
                      onChange={handleChange}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="mensaje" className="text-sm font-medium">
                      Mensaje *
                    </label>
                    <Textarea
                      id="mensaje"
                      name="mensaje"
                      placeholder="Cuéntanos más sobre tu consulta..."
                      value={formData.mensaje}
                      onChange={handleChange}
                      className="min-h-[150px] resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 gap-2"
                    disabled={enviando}
                  >
                    {enviando ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Enviar mensaje
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Al enviar, aceptas nuestra{" "}
                    <a href="/privacidad" className="text-primary hover:underline">
                      Política de Privacidad
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Información de contacto */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Para consultas generales:
                </p>
                <a 
                  href="mailto:hola@horariomedico.com"
                  className="text-lg font-semibold text-primary hover:underline block"
                >
                  hola@horariomedico.com
                </a>

                <p className="text-muted-foreground mt-4 mb-2">
                  Para soporte técnico:
                </p>
                <a 
                  href="mailto:soporte@horariomedico.com"
                  className="text-lg font-semibold text-primary hover:underline block"
                >
                  soporte@horariomedico.com
                </a>

                <p className="text-muted-foreground mt-4 mb-2">
                  Para temas legales:
                </p>
                <a 
                  href="mailto:legal@horariomedico.com"
                  className="text-lg font-semibold text-primary hover:underline block"
                >
                  legal@horariomedico.com
                </a>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Horario de atención
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lunes - Viernes:</span>
                  <span className="font-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sábado:</span>
                  <span className="font-semibold">10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domingo:</span>
                  <span className="font-semibold">Cerrado</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500 p-3 rounded mt-4">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    ℹ️ Respondemos todos los emails en menos de 24 horas hábiles
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  Teléfono
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-2">
                  Soporte telefónico:
                </p>
                <a 
                  href="tel:+1234567890"
                  className="text-2xl font-bold text-primary hover:underline block"
                >
                  +51 925 938 713
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Lunes a Viernes, 9:00 AM - 6:00 PM
                </p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-muted-foreground">
                  <p className="font-semibold text-foreground mb-2">Horario Médico Inc.</p>
                  <p>Av. Principal 123, Piso 5</p>
                  <p>Ciudad, Estado 12345</p>
                  <p>País</p>
                </address>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Rápidas */}
      <section className="container py-12 md:py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground text-lg">
              Respuestas rápidas a las dudas más comunes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿El servicio es gratis?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Sí, Horario Médico es 100% gratuito para pacientes y profesionales. 
                No hay cargos ocultos ni planes premium.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Cómo funcionan las notificaciones?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Usamos notificaciones del navegador que funcionan incluso cuando cierras la ventana, 
                gracias a Service Workers.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Mis datos están seguros?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Sí, toda tu información está encriptada con estándares bancarios (AES-256) 
                y cumplimos con normativas HIPAA.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Puedo eliminar mi cuenta?</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Sí, puedes eliminar tu cuenta en cualquier momento desde tu perfil. 
                Todos tus datos se borrarán permanentemente después de 30 días.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Espaciado para barra móvil */}
      <div className="md:hidden h-20" />
    </div>
  );
}
