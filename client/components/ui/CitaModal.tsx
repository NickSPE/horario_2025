import React from 'react';

type Paciente = {
    id?: string;
    user_id?: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
};

type Props = {
    show: boolean;
    onClose: () => void;
    formData: any;
    setFormData: (v: any) => void;
    pacientes: Paciente[];
    pacienteBusqueda: string;
    setPacienteBusqueda: (v: string) => void;
    pacienteResultados: Paciente[];
    pacienteLoading: boolean;
    handleSelectPaciente: (p: Paciente) => void;
    handleCreateCita: (e: React.FormEvent) => void;
    submitting: boolean;
    message: { type: string; text: string };
    todayISO: string;
};

export default function CitaModal({
    show,
    onClose,
    formData,
    setFormData,
    pacientes,
    pacienteBusqueda,
    setPacienteBusqueda,
    pacienteResultados,
    pacienteLoading,
    handleSelectPaciente,
    handleCreateCita,
    submitting,
    message,
    todayISO
}: Props) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold">Crear nueva cita</h4>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Cerrar</button>
                </div>
                <form onSubmit={handleCreateCita} className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">Buscar paciente</label>
                        <input
                            type="text"
                            placeholder="DNI, nombre, apellido, email o teléfono"
                            value={pacienteBusqueda}
                            onChange={(e) => setPacienteBusqueda(e.target.value)}
                            className="w-full mt-1 input"
                        />

                        {formData.paciente_id && (
                            <div className="mt-2 p-2 border border-gray-100 rounded-md flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-800">{formData.paciente_nombre} {formData.paciente_apellido}</div>
                                    <div className="text-xs text-gray-500">{formData.paciente_email || '—'} • {formData.paciente_telefono || '—'}</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, paciente_id: '', paciente_nombre: '', paciente_apellido: '', paciente_email: '', paciente_telefono: '' })}
                                    className="text-sm text-red-600"
                                >
                                    Quitar
                                </button>
                            </div>
                        )}

                        <div className="mt-2 max-h-40 overflow-auto border border-gray-100 rounded-md p-2 bg-gray-50">
                            {pacienteLoading ? (
                                <div className="text-center text-sm text-gray-500 py-6">Buscando pacientes...</div>
                            ) : (pacienteResultados && pacienteResultados.length > 0) ? (
                                pacienteResultados.map((p: any) => (
                                    <button
                                        type="button"
                                        key={p.user_id || p.id}
                                        onClick={() => { handleSelectPaciente(p); setPacienteBusqueda(''); }}
                                        className="w-full text-left px-3 py-2 rounded-md hover:bg-white/60 transition flex items-center gap-3"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-800">{p.nombre} {p.apellido}</div>
                                            <div className="text-xs text-gray-500">{p.email || '—'} • {p.telefono || '—'}</div>
                                        </div>
                                        <div className="text-xs text-blue-600">Seleccionar</div>
                                    </button>
                                ))
                            ) : (
                                pacientes
                                    .filter(p => {
                                        if (!pacienteBusqueda) return true;
                                        const q = pacienteBusqueda.toLowerCase();
                                        return (
                                            (p.nombre || '').toLowerCase().includes(q) ||
                                            (p.apellido || '').toLowerCase().includes(q) ||
                                            (p.email || '').toLowerCase().includes(q) ||
                                            (p.telefono || '').toLowerCase().includes(q)
                                        );
                                    })
                                    .map(p => (
                                        <button
                                            type="button"
                                            key={p.id}
                                            onClick={() => { handleSelectPaciente(p); setPacienteBusqueda(''); }}
                                            className="w-full text-left px-3 py-2 rounded-md hover:bg-white/60 transition flex items-center gap-3"
                                        >
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{p.nombre} {p.apellido}</div>
                                                <div className="text-xs text-gray-500">{p.email || '—'} • {p.telefono || '—'}</div>
                                            </div>
                                            <div className="text-xs text-blue-600">Seleccionar</div>
                                        </button>
                                    ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                            className="input"
                            type="date"
                            value={formData.fecha}
                            onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                            min={todayISO}
                            required
                        />
                        <input
                            className="input"
                            type="time"
                            value={formData.hora}
                            onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                            required
                        />
                        <select
                            className="input"
                            value={formData.tipo_cita}
                            onChange={(e) => setFormData({ ...formData, tipo_cita: e.target.value })}
                        >
                            <option value="consulta">Consulta</option>
                            <option value="control">Control</option>
                            <option value="teleconsulta">Teleconsulta</option>
                        </select>
                    </div>

                    <textarea
                        className="input"
                        placeholder="Notas (opcional)"
                        value={formData.notas}
                        onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    />

                    <div className="flex items-center justify-end gap-3 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-100">Cancelar</button>
                        <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white">{submitting ? 'Guardando...' : 'Crear cita'}</button>
                    </div>
                    {message.text && (
                        <p className={`text-sm mt-2 ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>
                    )}
                </form>
            </div>
        </div>
    );
}
