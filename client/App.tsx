import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MainLayout from "@/components/layout/MainLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProfesionalLayout from "@/pages/profesional/Layout";
import ProfesionalInicio from "@/pages/profesional/Inicio";
import ProfesionalPacientes from "@/pages/profesional/Pacientes";
import ProfesionalRecetas from "@/pages/profesional/Recetas";
import ProfesionalVideollamadas from "@/pages/profesional/Videollamadas";
import ProfesionalPerfil from "@/pages/profesional/Perfil";
import ProfesionalAsignar from "@/pages/profesional/Asignar";
import Medicamentos from "@/pages/profesional/Medicamentos";
import PacienteLayout from "@/pages/paciente/Layout";
import PacienteInicio from "@/pages/paciente/Inicio";
import PacienteRecetas from "@/pages/paciente/Recetas";
import PacienteCitas from "@/pages/paciente/Citas";
import PacienteMensajes from "@/pages/paciente/Mensajes";
import PacientePerfil from "@/pages/paciente/Perfil";
import PacienteMedicamentos from "@/pages/paciente/Medicamentos";
import Recordatorios from "@/pages/paciente/Recordatorios";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";

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

              <Route
                path="dashboard/profesional"
                element={
                  <ProtectedRoute requiredRole="profesional">
                    <ProfesionalLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<ProfesionalInicio />} />
                <Route path="pacientes" element={<ProfesionalPacientes />} />
                <Route path="recetas" element={<ProfesionalRecetas />} />
                <Route path="medicamentos" element={<Medicamentos />} />
                <Route path="asignar" element={<ProfesionalAsignar />} />
                <Route
                  path="videollamadas"
                  element={<ProfesionalVideollamadas />}
                />
                <Route path="perfil" element={<ProfesionalPerfil />} />
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
                <Route path="mensajes" element={<PacienteMensajes />} />
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
