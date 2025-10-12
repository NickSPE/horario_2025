import "./global.css";

import ProtectedRoute from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import PacienteCitas from "@/pages/paciente/Citas";
import PacienteInicio from "@/pages/paciente/Inicio";
import PacienteLayout from "@/pages/paciente/Layout";
import PacienteMedicamentos from "@/pages/paciente/Medicamentos";
import PacientePerfil from "@/pages/paciente/Perfil";
import PacienteRecetas from "@/pages/paciente/Recetas";
import Recordatorios from "@/pages/paciente/Recordatorios";
import ProfesionalAsignar from "@/pages/profesional/Asignar";
import ProfesionalInicio from "@/pages/profesional/Inicio";
import ProfesionalLayout from "@/pages/profesional/Layout";
import Medicamentos from "@/pages/profesional/Medicamentos";
import ProfesionalPerfil from "@/pages/profesional/Perfil";
import ProfesionalRecetas from "@/pages/profesional/Recetas";
import ComoFunciona from "@/pages/sistema/ComoFunciona";
import Contacto from "@/pages/sistema/Contacto";
import Funciones from "@/pages/sistema/Funciones";
import Index from "@/pages/sistema/Index";
import Login from "@/pages/sistema/Login";
import NotFound from "@/pages/sistema/NotFound";
import Privacidad from "@/pages/sistema/Privacidad";
import Register from "@/pages/sistema/Register";
import Terminos from "@/pages/sistema/Terminos";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProfesionalCalendario from "./pages/profesional/Calendario";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="registro" element={<Register />} />
              <Route path="funciones" element={<Funciones />} />
              <Route path="como-funciona" element={<ComoFunciona />} />
              <Route path="terminos" element={<Terminos />} />
              <Route path="privacidad" element={<Privacidad />} />
              <Route path="contacto" element={<Contacto />} />

              <Route
                path="dashboard/profesional"
                element={
                  <ProtectedRoute requiredRole="profesional">
                    <ProfesionalLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfesionalInicio />} />
                <Route path="recetas" element={<ProfesionalRecetas />} />
                <Route path="medicamentos" element={<Medicamentos />} />
                <Route path="asignar" element={<ProfesionalAsignar />} />
                <Route path="perfil" element={<ProfesionalPerfil />} />
                <Route path="calendario" element={<ProfesionalCalendario />} />
              </Route>

              <Route
                path="dashboard/paciente"
                element={
                  <ProtectedRoute requiredRole="paciente">
                    <PacienteLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<PacienteInicio />} />
                <Route path="recetas" element={<PacienteRecetas />} />
                <Route path="medicamentos" element={<PacienteMedicamentos />} />
                <Route path="recordatorios" element={<Recordatorios />} />
                <Route path="citas" element={<PacienteCitas />} />
                <Route path="perfil" element={<PacientePerfil />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
