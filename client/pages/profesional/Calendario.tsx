"'use client'";

import CitaModal from '@/components/ui/CitaModal';
import { useAuth } from "@/hooks/use-auth";
import { getSupabase } from "@/lib/supabase";
import { Calendar, ChevronLeft, ChevronRight, Clock, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from "react";

export default function ProfesionalCalendario() {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [busqueda, setBusqueda] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        paciente_nombre: '',
        paciente_apellido: '',
        paciente_email: '',
        paciente_telefono: '',
        fecha: '',
        hora: '',
        tipo_cita: 'consulta',
        duracion_minutos: 30,
        notas: '',
        paciente_id: ''
    });
    const [pacientes, setPacientes] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [pacienteBusqueda, setPacienteBusqueda] = useState('');
    const [pacienteResultados, setPacienteResultados] = useState([]);
    const [pacienteLoading, setPacienteLoading] = useState(false);

    const supabase = getSupabase();

    useEffect(() => {
        if (user?.id) {
            fetchCitas();
            fetchPacientes();
        }
    }, [user?.id]);

    // Funciones del calendario
    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const formatDate = (date) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options);
    };

    const formatDateISO = (date) => {
        return date.toISOString().split('T')[0];
    };

    // Fecha mínima (hoy) en formato ISO para usar en el input date
    const todayISO = formatDateISO(new Date());

    const formatTime = (time) => {
        if (!time) return '';
        return time.slice(0, 5);
    };

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysCount = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysCount; i++) {
        calendarDays.push(i);
    }

    const isToday = (day) => {
        const today = new Date();
        return day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
    };

    const isSelected = (day) => {
        return selectedDate &&
            day === selectedDate.getDate() &&
            month === selectedDate.getMonth() &&
            year === selectedDate.getFullYear();
    };

    const handleDayClick = (day) => {
        if (day) {
            setSelectedDate(new Date(year, month, day));
        }
    };

    // Fetch citas
    async function fetchCitas() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('citas')
                .select('*')
                .eq('profesional_id', user?.id)
                .order('fecha', { ascending: true });

            if (error) {
                console.error('Error fetching citas:', error);
                setMessage({ type: 'error', text: 'Error al cargar las citas' });
            } else {
                setCitas(data || []);
            }
        } finally {
            setLoading(false);
        }
    }

    // Fetch pacientes
    async function fetchPacientes() {
        try {
            const { data, error } = await supabase
                .from('pacientes')
                .select('id, user_id, nombre, apellido, email, telefono')
                .eq('profesional_id', user?.id);

            if (error) {
                console.error('Error fetching pacientes:', error);
            } else {
                setPacientes(data || []);
            }
        } catch (err) {
            console.error('Error:', err);
        }
    }

    // Crear cita
    async function handleCreateCita(e) {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            if (!formData.paciente_nombre || !formData.fecha || !formData.hora) {
                setMessage({ type: 'error', text: 'Por favor completa los campos requeridos' });
                return;
            }

            // Validar que la fecha no sea anterior a hoy (cumple con CHECK fecha_futura en la DB)
            // formData.fecha se espera en formato 'YYYY-MM-DD'
            if (formData.fecha < formatDateISO(new Date())) {
                setMessage({ type: 'error', text: 'La fecha debe ser hoy o una fecha futura' });
                return;
            }

            const { error } = await supabase.from('citas').insert([
                {
                    profesional_id: user?.id,
                    paciente_id: formData.paciente_id || null,
                    paciente_nombre: formData.paciente_nombre,
                    paciente_apellido: formData.paciente_apellido,
                    paciente_email: formData.paciente_email,
                    paciente_telefono: formData.paciente_telefono,
                    fecha: formData.fecha,
                    hora: formData.hora,
                    tipo_cita: formData.tipo_cita,
                    duracion_minutos: formData.duracion_minutos,
                    notas: formData.notas,
                    estado: 'pendiente'
                }
            ]);

            if (error) {
                setMessage({ type: 'error', text: `Error: ${error.message}` });
            } else {
                setMessage({ type: 'success', text: 'Cita creada exitosamente' });
                setFormData({
                    paciente_nombre: '',
                    paciente_apellido: '',
                    paciente_email: '',
                    paciente_telefono: '',
                    fecha: '',
                    hora: '',
                    tipo_cita: 'consulta',
                    duracion_minutos: 30,
                    notas: '',
                    paciente_id: ''
                });
                setTimeout(() => {
                    setShowModal(false);
                    fetchCitas();
                }, 1500);
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Error inesperado' });
            console.error('Error:', err);
        } finally {
            setSubmitting(false);
        }
    }

    // Seleccionar paciente
    const handleSelectPaciente = (paciente) => {
        setFormData({
            ...formData,
            paciente_id: paciente.user_id,
            paciente_nombre: paciente.nombre,
            paciente_apellido: paciente.apellido,
            paciente_email: paciente.email,
            paciente_telefono: paciente.telefono
        });
        // limpiar búsqueda y resultados del modal
        setPacienteBusqueda('');
        setPacienteResultados([]);
    };

    // Buscar pacientes en el servidor con debounce (cuando se escribe en el input del modal)
    useEffect(() => {
        const term = pacienteBusqueda?.trim() || '';
        if (term.length < 2) {
            // si el término es corto, limpiamos resultados remotos
            setPacienteResultados([]);
            setPacienteLoading(false);
            return;
        }

        let mounted = true;
        const timer = setTimeout(async () => {
            setPacienteLoading(true);
            try {
                const { data, error } = await supabase.rpc('buscar_pacientes', { termino: term });
                if (!mounted) return;
                if (error) {
                    console.error('Error buscar_pacientes:', error);
                    setPacienteResultados([]);
                } else {
                    setPacienteResultados(data || []);
                }
            } catch (err) {
                console.error('Error al buscar pacientes:', err);
                setPacienteResultados([]);
            } finally {
                if (mounted) setPacienteLoading(false);
            }
        }, 400);

        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [pacienteBusqueda, supabase]);

    // Filtrar citas por fecha
    // Filtrado por fecha y por búsqueda
    const filtroPorFecha = selectedDate
        ? citas.filter(c => c.fecha === formatDateISO(selectedDate))
        : citas;

    const citasFecha = busqueda
        ? filtroPorFecha.filter(c => {
            const q = busqueda.toLowerCase();
            return (
                (c.paciente_nombre || '').toLowerCase().includes(q) ||
                (c.paciente_apellido || '').toLowerCase().includes(q) ||
                (c.paciente_email || '').toLowerCase().includes(q) ||
                (c.paciente_telefono || '').toLowerCase().includes(q)
            );
        })
        : filtroPorFecha;

    const totalCitas = citas.length;
    const citasHoy = citas.filter(c => c.fecha === formatDateISO(new Date())).length;
    const diasConCitas = new Set(citas.map(c => new Date(c.fecha).getDate()));

    const getEstadoColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'completada':
                return 'bg-green-100 text-green-700';
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-700';
            case 'cancelada':
                return 'bg-red-100 text-red-700';
            case 'no_asistio':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8">
            {/* Header */}

            {/* Grid principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Calendario */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-8">
                            <button
                                onClick={previousMonth}
                                className="p-2 hover:bg-blue-50 rounded-lg transition duration-200 hover:text-blue-600"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">{monthNames[month]}</h2>
                                <p className="text-gray-500 text-sm mt-1">{year}</p>
                            </div>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-blue-50 rounded-lg transition duration-200 hover:text-blue-600"
                            >
                                <ChevronRight size={22} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-6">
                            {dayNames.map((day) => (
                                <div key={day} className="text-center font-bold text-blue-600 py-3 text-sm">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-8">
                            {calendarDays.map((day, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleDayClick(day)}
                                    disabled={!day}
                                    className={`
                        py-3 rounded-lg font-semibold transition-all duration-200 text-sm relative
                        ${!day ? 'opacity-0 cursor-default' : ''}
                        ${isToday(day) ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg scale-105' : ''}
                        ${isSelected(day) && !isToday(day) ? 'bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-md' : ''}
                        ${day && !isToday(day) && !isSelected(day) ? 'hover:bg-blue-50 cursor-pointer text-gray-700 border border-transparent hover:border-blue-200' : ''}
                      `}
                                >
                                    {day}
                                    {day && diasConCitas.has(day) && !isToday(day) && !isSelected(day) && (
                                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {selectedDate && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={18} className="text-blue-600" />
                                    <p className="text-sm font-semibold text-gray-600">Fecha seleccionada</p>
                                </div>
                                <p className="text-base font-bold text-blue-600 capitalize">
                                    {formatDate(selectedDate)}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {citasFecha.length} cita{citasFecha.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Citas */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-100">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Calendar className="text-blue-600" size={28} />
                                {selectedDate ? `Citas - ${formatDate(selectedDate)}` : 'Mis Citas'}
                            </h3>
                            <div className="flex items-center gap-3">
                                {selectedDate && (
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="text-sm px-3 py-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                    >
                                        Limpiar filtro
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        // prellenar fecha si hay selectedDate
                                        if (selectedDate) {
                                            setFormData(prev => ({ ...prev, fecha: formatDateISO(selectedDate) }));
                                        }
                                        setShowModal(true);
                                    }}
                                    className="text-sm px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition font-semibold"
                                >
                                    + Nueva cita
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin">
                                    <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
                                </div>
                                <p className="text-gray-500 mt-4">Cargando citas...</p>
                            </div>
                        ) : citasFecha.length > 0 ? (
                            <div className="space-y-3">
                                {citasFecha.map((cita) => (
                                    <div
                                        key={cita.id}
                                        className="group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-blue-50 hover:from-blue-50 hover:to-purple-50"
                                    >
                                        <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-md group-hover:shadow-lg transition flex-shrink-0">
                                            <User size={24} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-gray-800 text-lg">
                                                    {cita.paciente_nombre} {cita.paciente_apellido}
                                                </h4>
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getEstadoColor(cita.estado)}`}>
                                                    {cita.estado}
                                                </span>
                                            </div>
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5 hover:text-blue-600 transition">
                                                    <Clock size={16} className="flex-shrink-0" />
                                                    <span className="font-semibold">{formatTime(cita.hora)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 hover:text-blue-600 transition">
                                                    <Phone size={16} className="flex-shrink-0" />
                                                    <span>{cita.paciente_telefono || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 hover:text-blue-600 transition">
                                                    <Mail size={16} className="flex-shrink-0" />
                                                    <span className="truncate">{cita.paciente_email || 'N/A'}</span>
                                                </div>
                                            </div>
                                            {cita.notas && (
                                                <p className="text-xs text-gray-500 mt-2 italic">📝 {cita.notas}</p>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-2 flex-shrink-0">
                                            <button className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all font-semibold text-sm whitespace-nowrap">
                                                Detalles
                                            </button>
                                            <button className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm whitespace-nowrap">
                                                Editar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
                                    <Calendar size={48} className="text-blue-300" />
                                </div>
                                <p className="text-gray-600 text-lg font-medium">
                                    {selectedDate
                                        ? '📅 No hay citas agendadas para esta fecha'
                                        : '👉 Selecciona una fecha para ver tus citas'}
                                </p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {selectedDate ? 'Intenta con otra fecha' : 'Haz clic en un día del calendario'}
                                </p>
                            </div>
                        )}
                        {/* Modal crear cita: componente reutilizable */}
                        <CitaModal
                            show={showModal}
                            onClose={() => setShowModal(false)}
                            formData={formData}
                            setFormData={setFormData}
                            pacientes={pacientes}
                            pacienteBusqueda={pacienteBusqueda}
                            setPacienteBusqueda={setPacienteBusqueda}
                            pacienteResultados={pacienteResultados}
                            pacienteLoading={pacienteLoading}
                            handleSelectPaciente={handleSelectPaciente}
                            handleCreateCita={handleCreateCita}
                            submitting={submitting}
                            message={message}
                            todayISO={todayISO}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}