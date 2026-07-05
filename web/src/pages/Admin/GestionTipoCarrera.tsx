// src/components/admin/GestionConfiguracion.tsx
import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Link2, Unlink, Save, X } from 'lucide-react';
import { carrerasApi } from '../../api/endpoints/carreras';
import { showConfirmAlert, showErrorAlert, showSuccessAlert, showWarningAlert } from '../../helpers/alerts';

interface TipoCarrera {
    id_tipo_carrera: number;
    nombre: string;
    descripcion?: string;
    fecha_creacion: string;
    fecha_eliminacion?: string;
}

interface TipoTrabajo {
    id_tipo_trabajo: number;
    nombre: string;
    fecha_creacion: string;
    fecha_eliminacion?: string;
}

interface Asociacion {
    id_carrera_tipo_trabajo: number;
    id_tipo_carrera: number;
    id_tipo_trabajo: number;
    nombre_carrera: string;
    nombre_trabajo: string;
    fecha_creacion: string;
}

export function GestionTipoCarrera() {
    const [tiposCarrera, setTiposCarrera] = useState<TipoCarrera[]>([]);
    const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajo[]>([]);
    const [asociaciones, setAsociaciones] = useState<Asociacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'carreras' | 'trabajos' | 'asociaciones'>('carreras');

    // Estados para modales
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '' });

    // Estados para asociaciones
    const [showAsociarModal, setShowAsociarModal] = useState(false);
    const [asociarData, setAsociarData] = useState({ id_tipo_carrera: 0, id_tipo_trabajo: 0 });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [carreras, trabajos, asociaciones] = await Promise.all([
                carrerasApi.listarTiposCarrera(),
                carrerasApi.listarTiposTrabajo(),
                carrerasApi.listarAsociaciones()
            ]);

            if (carreras.success) setTiposCarrera(carreras.data.filter((c: any) => !c.fecha_eliminacion));
            if (trabajos.success) setTiposTrabajo(trabajos.data.filter((t: any) => !t.fecha_eliminacion));
            if (asociaciones.success) setAsociaciones(asociaciones.data);
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCrear = async () => {
        try {
            let response;
            if (activeTab === 'carreras') {
                response = await carrerasApi.crearTipoCarrera(formData);
            } else {
                response = await carrerasApi.crearTipoTrabajo({ nombre: formData.nombre });
            }

            if (response.success) {
                await cargarDatos();
                setShowModal(false);
                setFormData({ nombre: '', descripcion: '' });
            }
        } catch (error) {
            console.error('Error al crear:', error);
        }
    };

    // Agregar esta función después de handleCrear
    const handleActualizar = async () => {
        if (!editingItem) return;

        try {
            let response;
            if (activeTab === 'carreras') {
                response = await carrerasApi.actualizarTipoCarrera(
                    editingItem.id_tipo_carrera,
                    { 
                        nombre: formData.nombre,
                        descripcion: formData.descripcion 
                    }
                );
            } else {
                response = await carrerasApi.actualizarTipoTrabajo(
                    editingItem.id_tipo_trabajo,
                    { nombre: formData.nombre }
                );
            }

            if (response.success) {
                await cargarDatos();
                setShowModal(false);
                setEditingItem(null);
                setFormData({ nombre: '', descripcion: '' });
                // Mostrar mensaje de éxito
                showSuccessAlert(' Actualizado correctamente');
            } else {
                showErrorAlert(response.message || 'Error al actualizar');
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
            showErrorAlert(' Error al actualizar');
        }
    };

    const handleEliminar = async (id: number, tipo: 'carrera' | 'trabajo') => {
        const confirmed = await showConfirmAlert(
            'Eliminar ',
            `¿Estás seguro de eliminar este registro?`
        );
            
        if (!confirmed) return;

        try {
            let response;
            if (tipo === 'carrera') {
                response = await carrerasApi.eliminarTipoCarrera(id);
            } else {
                response = await carrerasApi.eliminarTipoTrabajo(id);
            }

            if (response.success) {
                await cargarDatos();
            } else {
                showErrorAlert(response.message || 'Error al eliminar');
            }
        } catch (error) {
            showErrorAlert('Error al asociar');
            console.error('Error al eliminar:', error);
        }
    };

    const handleAsociar = async () => {
        if (!asociarData.id_tipo_carrera || !asociarData.id_tipo_trabajo) {
            showWarningAlert('Selecciona una carrera y un tipo de trabajo');
            return;
        }

        try {
            const response = await carrerasApi.crearAsociacion(asociarData);
            if (response.success) {
                await cargarDatos();
                setShowAsociarModal(false);
                setAsociarData({ id_tipo_carrera: 0, id_tipo_trabajo: 0 });
            } else {
                showErrorAlert(response.message || 'Error al asociar');
            }
        } catch (error) {
            showErrorAlert('Error al asociar');
            console.error('Error al asociar:', error);
        }
    };

    const handleDesasociar = async (id: number) => {
        const confirmed = await showConfirmAlert( '¿Seguro?','¿Deseas eliminar esta asociación?' );        
        if (!confirmed) return;

        try {
            const response = await carrerasApi.eliminarAsociacion(id);
            if (response.success) {
                await cargarDatos();
            }
        } catch (error) {
            console.error('Error al desasociar:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Configuración del Catálogo</h1>
                    <p className="text-sm text-gray-500">Gestiona tipos de carrera, tipos de trabajo y sus asociaciones</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({ nombre: '', descripcion: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('carreras')}
                    className={`px-4 py-2 font-medium transition ${
                        activeTab === 'carreras'
                            ? 'border-b-2 border-cyan-600 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Tipos de Carrera
                </button>
                <button
                    onClick={() => setActiveTab('trabajos')}
                    className={`px-4 py-2 font-medium transition ${
                        activeTab === 'trabajos'
                            ? 'border-b-2 border-cyan-600 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Tipos de Trabajo
                </button>
                <button
                    onClick={() => setActiveTab('asociaciones')}
                    className={`px-4 py-2 font-medium transition ${
                        activeTab === 'asociaciones'
                            ? 'border-b-2 border-cyan-600 text-cyan-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Asociaciones
                </button>
            </div>

            {/* Contenido */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {activeTab === 'carreras' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-600">Nombre</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Descripción</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Fecha</th>
                                    <th className="text-center p-4 font-semibold text-gray-600">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tiposCarrera.map((item) => (
                                    <tr key={item.id_tipo_carrera} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium">{item.nombre}</td>
                                        <td className="p-4 text-gray-600">{item.descripcion || '-'}</td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(item.fecha_creacion).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setFormData({
                                                        nombre: item.nombre,
                                                        descripcion: item.descripcion || ''
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 p-1 transition"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => handleEliminar(item.id_tipo_carrera, 'carrera')}
                                                className="text-red-600 hover:text-red-800 p-1 ml-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tiposCarrera.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            No hay tipos de carrera registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'trabajos' && (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-600">Nombre</th>
                                    <th className="text-left p-4 font-semibold text-gray-600">Fecha</th>
                                    <th className="text-center p-4 font-semibold text-gray-600">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tiposTrabajo.map((item) => (
                                    <tr key={item.id_tipo_trabajo} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-medium">{item.nombre}</td>
                                        <td className="p-4 text-gray-500 text-sm">
                                            {new Date(item.fecha_creacion).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item);
                                                    setFormData({
                                                        nombre: item.nombre,
                                                        descripcion: ''
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 p-1 transition"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(item.id_tipo_trabajo, 'trabajo')}
                                                className="text-red-600 hover:text-red-800 p-1 ml-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tiposTrabajo.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-8 text-center text-gray-500">
                                            No hay tipos de trabajo registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'asociaciones' && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-gray-800">Asociaciones Carrera - Tipo de Trabajo</h3>
                            <button
                                onClick={() => setShowAsociarModal(true)}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                            >
                                <Link2 className="h-4 w-4" />
                                Nueva Asociación
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-600">Carrera</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Tipo de Trabajo</th>
                                        <th className="text-left p-4 font-semibold text-gray-600">Fecha</th>
                                        <th className="text-center p-4 font-semibold text-gray-600">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {asociaciones.map((item) => (
                                        <tr key={item.id_carrera_tipo_trabajo} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-medium">{item.nombre_carrera}</td>
                                            <td className="p-4 font-medium text-cyan-600">{item.nombre_trabajo}</td>
                                            <td className="p-4 text-gray-500 text-sm">
                                                {new Date(item.fecha_creacion).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => handleDesasociar(item.id_carrera_tipo_trabajo)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                >
                                                    <Unlink className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {asociaciones.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">
                                                No hay asociaciones registradas
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal para crear/editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingItem ? 'Editar' : 'Nuevo'} 
                                {activeTab === 'carreras' ? ' Tipo de Carrera' : ' Tipo de Trabajo'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500"
                                    placeholder="Ingresa el nombre"
                                />
                            </div>

                            {activeTab === 'carreras' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500"
                                        rows={3}
                                        placeholder="Descripción del tipo de carrera"
                                    />
                                </div>
                            )}

                             {/* Mostrar info de edición */}
                            {editingItem && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                                    <p>Editando: <strong>{editingItem.nombre}</strong></p>
                                    <p className="mt-1">Creado: {new Date(editingItem.fecha_creacion).toLocaleDateString()}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={editingItem ? handleActualizar : handleCrear}
                                    disabled={!formData.nombre}
                                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition disabled:opacity-50 ${
                                        editingItem 
                                            ? 'bg-blue-600 hover:bg-blue-700' 
                                            : 'bg-cyan-600 hover:bg-cyan-700'
                                    }`}
                                >
                                    {editingItem ? (
                                        <>
                                            <Save className="h-4 w-4 inline mr-2" />
                                            Actualizar
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 inline mr-2" />
                                            Crear
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingItem(null);
                                        setFormData({ nombre: '', descripcion: '' });
                                    }}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para asociar */}
            {showAsociarModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Asociar Carrera - Tipo de Trabajo</h2>
                            <button onClick={() => setShowAsociarModal(false)} className="p-2 hover:bg-gray-100 rounded">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Carrera</label>
                                <select
                                    value={asociarData.id_tipo_carrera}
                                    onChange={(e) => setAsociarData({ ...asociarData, id_tipo_carrera: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value={0}>Selecciona...</option>
                                    {tiposCarrera.map((c) => (
                                        <option key={c.id_tipo_carrera} value={c.id_tipo_carrera}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Trabajo</label>
                                <select
                                    value={asociarData.id_tipo_trabajo}
                                    onChange={(e) => setAsociarData({ ...asociarData, id_tipo_trabajo: parseInt(e.target.value) })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500"
                                >
                                    <option value={0}>Selecciona...</option>
                                    {tiposTrabajo.map((t) => (
                                        <option key={t.id_tipo_trabajo} value={t.id_tipo_trabajo}>
                                            {t.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAsociar}
                                    disabled={!asociarData.id_tipo_carrera || !asociarData.id_tipo_trabajo}
                                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    <Link2 className="h-4 w-4 inline mr-2" />
                                    Asociar
                                </button>
                                <button
                                    onClick={() => setShowAsociarModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}