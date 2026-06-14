import { Ionicons } from '@expo/vector-icons';
import { MultiSelect } from '@carlos3g/element-dropdown';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { adminApi } from '@/services/api/endpoints/admin';
import { router } from 'expo-router';

interface LogActividad {
    id_log: number;
    esquema: string;
    tabla: string;
    registro_id: number;
    accion: string;
    fecha: string;
    id_usuario: number;
    usuario_nombre: string;
    usuario_email: string;
    ip_address: string;
    user_agent: string;
    datos_anteriores?: any;
    datos_nuevos?: any;
}

interface OptionType {
    label: string;
    value: string;
}

export default function AuditoriaScreen() {
    const [logs, setLogs] = useState<LogActividad[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedLog, setSelectedLog] = useState<LogActividad | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    
    // Filtros - ahora con arrays para multi-select
    const [selectedAcciones, setSelectedAcciones] = useState<string[]>([]);
    const [selectedTablas, setSelectedTablas] = useState<string[]>([]);
    const [usuario, setUsuario] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [accionesDisponibles, setAccionesDisponibles] = useState<OptionType[]>([]);
    const [tablasDisponibles, setTablasDisponibles] = useState<OptionType[]>([]);

    useEffect(() => {
        cargarLogs();
        cargarFiltros();
    }, [page, selectedAcciones, selectedTablas, usuario, fechaDesde, fechaHasta]);

    const cargarLogs = async () => {
        setLoading(true);
        try {
            const result = await adminApi.obtenerLogsAuditoria({
                page,
                limit: 15,
                accion: selectedAcciones.length > 0 ? selectedAcciones.join(',') : undefined,
                tabla: selectedTablas.length > 0 ? selectedTablas.join(',') : undefined,
                usuario: usuario || undefined,
                fecha_desde: fechaDesde || undefined,
                fecha_hasta: fechaHasta || undefined
            });

            if (result.success) {
                setLogs(result.data);
                setTotalPages(result.pagination.pages);
                setTotal(result.pagination.total);
            }
        } catch (error) {
            console.error('Error cargando logs:', error);
            Alert.alert('Error', 'No se pudieron cargar los logs');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const cargarFiltros = async () => {
        try {
            const [acciones, tablas] = await Promise.all([
                adminApi.obtenerAccionesAuditoria(),
                adminApi.obtenerTablasAuditoria()
            ]);
            
            if (acciones.success) {
                setAccionesDisponibles(acciones.data.map((a: string) => ({ label: a, value: a })));
            }
            if (tablas.success) {
                setTablasDisponibles(tablas.data.map((t: any) => ({ 
                    label: `${t.esquema}.${t.tabla}`, 
                    value: t.tabla 
                })));
            }
        } catch (error) {
            console.error('Error cargando filtros:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        cargarLogs();
    };

    const loadMore = () => {
        if (page < totalPages && !loading) {
            setPage(prev => prev + 1);
        }
    };

    const limpiarFiltros = () => {
        setSelectedAcciones([]);
        setSelectedTablas([]);
        setUsuario('');
        setFechaDesde('');
        setFechaHasta('');
        setPage(1);
        setShowFilters(false);
    };

    const getAccionColor = (accion: string) => {
        switch (accion) {
            case 'INSERT': return { bg: '#dcfce7', text: '#166534', icon: 'add-circle-outline' };
            case 'UPDATE': return { bg: '#dbeafe', text: '#1e40af', icon: 'create-outline' };
            case 'DELETE': return { bg: '#fee2e2', text: '#991b1b', icon: 'trash-outline' };
            default: return { bg: '#f3f4f6', text: '#374151', icon: 'document-text-outline' };
        }
    };

    const renderLogItem = ({ item }: { item: LogActividad }) => {
        const color = getAccionColor(item.accion);
        
        return (
            <TouchableOpacity
                className="bg-white rounded-xl p-4 mx-5 my-2 border border-gray-200"
                onPress={() => setSelectedLog(item)}
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="rounded-full px-2 py-1" style={{ backgroundColor: color.bg }}>
                                <Text className="text-xs" style={{ color: color.text }}>{item.accion}</Text>
                            </View>
                            <Text className="text-xs text-gray-400">{new Date(item.fecha).toLocaleString()}</Text>
                        </View>
                        <Text className="text-gray-700 font-medium">{item.tabla}</Text>
                        <Text className="text-gray-500 text-sm mt-1">
                            Usuario: {item.usuario_nombre || 'Sistema'}
                        </Text>
                        <Text className="text-gray-400 text-xs mt-1">
                            IP: {item.ip_address || '-'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="bg-cyan-600 pt-12 pb-4 px-5">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="w-10">
                        <Ionicons name="arrow-back-outline" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Auditoría</Text>
                        <Text className="text-white/80 text-sm">Registro de actividades del sistema</Text>
                    </View>
                </View>
            </View>

            {/* Tarjeta de total */}
            <View className="bg-white rounded-xl shadow-sm p-4 mx-5 mt-4 border border-gray-100">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-500 text-sm">Total registros</Text>
                        <Text className="text-2xl font-bold text-gray-800">{total}</Text>
                    </View>
                    <View className="w-12 h-12 bg-cyan-100 rounded-full items-center justify-center">
                        <Ionicons name="document-text-outline" size={24} color="#06b6d4" />
                    </View>
                </View>
            </View>

            {/* Botón de filtros */}
            <TouchableOpacity
                className="flex-row items-center justify-between bg-gray-100 rounded-xl mx-5 mt-4 px-4 py-3"
                onPress={() => setShowFilters(!showFilters)}
            >
                <View className="flex-row items-center">
                    <Ionicons name="options-outline" size={20} color="#6B7280" />
                    <Text className="text-gray-600 ml-2">Filtros</Text>
                    {(selectedAcciones.length > 0 || selectedTablas.length > 0 || usuario || fechaDesde || fechaHasta) && (
                        <View className="ml-2 bg-cyan-500 rounded-full px-2 py-0.5">
                            <Text className="text-white text-xs">
                                {selectedAcciones.length + selectedTablas.length + (usuario ? 1 : 0) + (fechaDesde ? 1 : 0) + (fechaHasta ? 1 : 0)}
                            </Text>
                        </View>
                    )}
                </View>
                <Ionicons name={showFilters ? "chevron-up" : "chevron-down"} size={20} color="#6B7280" />
            </TouchableOpacity>

            {/* Panel de filtros con MultiSelect */}
            {showFilters && (
                <View className="bg-gray-50 rounded-xl mx-5 mt-2 p-4">
                    {/* Multi-select para Tablas */}
                    <View className="mb-4">
                        <Text className="text-xs font-semibold text-gray-600 mb-2">Tablas</Text>
                        <MultiSelect
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                borderRadius: 8,
                                padding: 8,
                                minHeight: 50,
                            }}
                            placeholderStyle={{ fontSize: 14, color: '#9ca3af' }}
                            selectedTextStyle={{ fontSize: 14 }}
                            inputSearchStyle={{ height: 40, fontSize: 14 }}
                            iconStyle={{ width: 20, height: 20 }}
                            search
                            data={tablasDisponibles}
                            labelField="label"
                            valueField="value"
                            placeholder="Selecciona tablas"
                            searchPlaceholder="Buscar tabla..."
                            value={selectedTablas}
                            onChange={setSelectedTablas}
                        />
                    </View>

                    {/* Multi-select para Acciones */}
                    <View className="mb-4">
                        <Text className="text-xs font-semibold text-gray-600 mb-2">Acciones</Text>
                        <MultiSelect
                            style={{
                                backgroundColor: 'white',
                                borderWidth: 1,
                                borderColor: '#d1d5db',
                                borderRadius: 8,
                                padding: 8,
                                minHeight: 50,
                            }}
                            placeholderStyle={{ fontSize: 14, color: '#9ca3af' }}
                            selectedTextStyle={{ fontSize: 14 }}
                            inputSearchStyle={{ height: 40, fontSize: 14 }}
                            iconStyle={{ width: 20, height: 20 }}
                            search
                            data={accionesDisponibles}
                            labelField="label"
                            valueField="value"
                            placeholder="Selecciona acciones"
                            searchPlaceholder="Buscar acción..."
                            value={selectedAcciones}
                            onChange={setSelectedAcciones}
                        />
                    </View>

                    {/* Usuario */}
                    <View className="mb-4">
                        <Text className="text-xs font-semibold text-gray-600 mb-2">Usuario</Text>
                        <TextInput
                            className="bg-white border border-gray-300 rounded-lg p-2 text-sm"
                            placeholder="Nombre de usuario"
                            value={usuario}
                            onChangeText={setUsuario}
                        />
                    </View>

                    {/* Fechas */}
                    <View className="flex-row gap-3 mb-4">
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Fecha desde</Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-lg p-2 text-sm"
                                placeholder="YYYY-MM-DD"
                                value={fechaDesde}
                                onChangeText={setFechaDesde}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-semibold text-gray-600 mb-2">Fecha hasta</Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-lg p-2 text-sm"
                                placeholder="YYYY-MM-DD"
                                value={fechaHasta}
                                onChangeText={setFechaHasta}
                            />
                        </View>
                    </View>

                    {/* Badges de filtros activos */}
                    {(selectedAcciones.length > 0 || selectedTablas.length > 0 || usuario || fechaDesde || fechaHasta) && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                            <View className="flex-row flex-wrap gap-2">
                                {selectedTablas.map(tabla => (
                                    <View key={tabla} className="bg-cyan-100 rounded-full px-3 py-1 flex-row items-center">
                                        <Text className="text-cyan-700 text-xs">{tabla}</Text>
                                        <TouchableOpacity onPress={() => setSelectedTablas(selectedTablas.filter(t => t !== tabla))} className="ml-1">
                                            <Ionicons name="close-circle" size={14} color="#0891b2" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {selectedAcciones.map(accion => (
                                    <View key={accion} className="bg-green-100 rounded-full px-3 py-1 flex-row items-center">
                                        <Text className="text-green-700 text-xs">{accion}</Text>
                                        <TouchableOpacity onPress={() => setSelectedAcciones(selectedAcciones.filter(a => a !== accion))} className="ml-1">
                                            <Ionicons name="close-circle" size={14} color="#166534" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                {usuario && (
                                    <View className="bg-purple-100 rounded-full px-3 py-1 flex-row items-center">
                                        <Text className="text-purple-700 text-xs">👤 {usuario}</Text>
                                        <TouchableOpacity onPress={() => setUsuario('')} className="ml-1">
                                            <Ionicons name="close-circle" size={14} color="#6b21a5" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    )}

                    <TouchableOpacity
                        className="mt-2 py-2 bg-gray-200 rounded-lg items-center"
                        onPress={limpiarFiltros}
                    >
                        <Text className="text-gray-600 text-sm">Limpiar todos los filtros</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Lista de logs */}
            <FlatList
                data={logs}
                keyExtractor={(item) => item.id_log.toString()}
                renderItem={renderLogItem}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06b6d4']} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.3}
                ListEmptyComponent={() => (
                    <View className="flex-1 items-center justify-center py-20">
                        <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-center mt-4">No hay registros de actividad</Text>
                    </View>
                )}
                ListFooterComponent={() =>
                    loading && page > 1 ? (
                        <ActivityIndicator size="small" color="#06b6d4" className="py-4" />
                    ) : null
                }
                contentContainerStyle={{ paddingBottom: 80 }}
            />

            {/* Modal de detalle (sin cambios) */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={selectedLog !== null}
                onRequestClose={() => setSelectedLog(null)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl max-h-[80%]">
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                            <Text className="text-lg font-bold">Detalle de auditoría</Text>
                            <TouchableOpacity onPress={() => setSelectedLog(null)}>
                                <Ionicons name="close" size={24} color="#000000" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-4">
                            {selectedLog && (
                                <>
                                    <View className="mb-4">
                                        <Text className="text-gray-500 text-sm">ID Log</Text>
                                        <Text className="font-medium">{selectedLog.id_log}</Text>
                                    </View>
                                    <View className="mb-4">
                                        <Text className="text-gray-500 text-sm">Fecha</Text>
                                        <Text className="font-medium">{new Date(selectedLog.fecha).toLocaleString()}</Text>
                                    </View>
                                    <View className="mb-4">
                                        <Text className="text-gray-500 text-sm">Usuario</Text>
                                        <Text className="font-medium">{selectedLog.usuario_nombre || 'Sistema'}</Text>
                                        <Text className="text-xs text-gray-400">{selectedLog.usuario_email}</Text>
                                    </View>
                                    <View className="mb-4">
                                        <Text className="text-gray-500 text-sm">Tabla / Acción</Text>
                                        <Text className="font-medium">{selectedLog.tabla} - {selectedLog.accion}</Text>
                                    </View>
                                    <View className="mb-4">
                                        <Text className="text-gray-500 text-sm">IP / User Agent</Text>
                                        <Text className="font-medium">{selectedLog.ip_address || '-'}</Text>
                                        <Text className="text-xs text-gray-400" numberOfLines={2}>{selectedLog.user_agent}</Text>
                                    </View>

                                    {selectedLog.datos_anteriores && (
                                        <View className="mb-4">
                                            <Text className="text-sm font-semibold text-gray-700 mb-2">Datos anteriores</Text>
                                            <View className="bg-gray-100 p-3 rounded-lg">
                                                <Text className="text-xs font-mono">
                                                    {JSON.stringify(selectedLog.datos_anteriores, null, 2)}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {selectedLog.datos_nuevos && (
                                        <View className="mb-4">
                                            <Text className="text-sm font-semibold text-gray-700 mb-2">Datos nuevos</Text>
                                            <View className="bg-gray-100 p-3 rounded-lg">
                                                <Text className="text-xs font-mono">
                                                    {JSON.stringify(selectedLog.datos_nuevos, null, 2)}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}