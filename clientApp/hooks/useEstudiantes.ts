// hooks/useEstudiantes.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { buscarPorCedula } from '../services/api';

// Tipo de dato para un estudiante
interface Estudiante {
    id_estudiante?: number;
    nombre_completo: string;
    cedula: string;
    email: string;
    esExistente: boolean;
}

// Tipo para resultado de búsqueda
interface ResultadoBusqueda {
    id_estudiante: number;
    nombre_completo: string;
    cedula: string;
    email: string;
}

export const useEstudiantes = () => {
    // Estado principal: lista de estudiantes
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([
        { nombre_completo: '', cedula: '', email: '', esExistente: false }
    ]);
    
    // Estado para el modal
    const [modalVisible, setModalVisible] = useState(false);
    const [resultadoBusqueda, setResultadoBusqueda] = useState<ResultadoBusqueda | null>(null);
    const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
    const [buscando, setBuscando] = useState(false);

    // Agregar nuevo estudiante al final
    const agregarEstudiante = () => {
        setEstudiantes([
            ...estudiantes,
            { nombre_completo: '', cedula: '', email: '', esExistente: false }
        ]);
    };

    // Eliminar estudiante por índice
    const eliminarEstudiante = (index: number) => {
        if (estudiantes.length === 1) {
            Alert.alert('Error', 'Debe haber al menos un estudiante');
            return;
        }
        const nuevos = [...estudiantes];
        nuevos.splice(index, 1);
        setEstudiantes(nuevos);
    };

    // Actualizar campo de un estudiante
    const actualizarEstudiante = (index: number, campo: keyof Estudiante, valor: string) => {
        const nuevos = [...estudiantes];
        nuevos[index] = { ...nuevos[index], [campo]: valor, esExistente: false };
        setEstudiantes(nuevos);
    };

    // Buscar estudiante por cédula (cuando pierde el foco)
    const buscarEstudiantePorCedula = async (index: number, cedula: string) => {
        if (!cedula || cedula.length < 5) return;
        
        setBuscando(true);
        setIndiceEditando(index);
        
        try {
            const resultado = await buscarPorCedula('estudiante', cedula);
            console.log(resultado)
            if (resultado.success && resultado.data) {
                setResultadoBusqueda(resultado.data);
                setModalVisible(true); // Abrir modal
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setBuscando(false);
        }
    };

    // Usar estudiante existente (confirmar en modal)
    const usarEstudianteExistente = () => {
        if (resultadoBusqueda && indiceEditando !== null) {
            const nuevos = [...estudiantes];
            nuevos[indiceEditando] = {
                id_estudiante: resultadoBusqueda.id_estudiante,
                nombre_completo: resultadoBusqueda.nombre_completo,
                cedula: resultadoBusqueda.cedula,
                email: resultadoBusqueda.email || '',
                esExistente: true
            };
            setEstudiantes(nuevos);
        }
        setModalVisible(false);
        setResultadoBusqueda(null);
        setIndiceEditando(null);
    };

    // Continuar con estudiante nuevo (cancelar modal)
    const continuarConNuevoEstudiante = () => {
        setModalVisible(false);
        setResultadoBusqueda(null);
        setIndiceEditando(null);
    };

    // Limpiar todos los estudiantes
    const limpiarEstudiantes = () => {
        setEstudiantes([{ nombre_completo: '', cedula: '', email: '', esExistente: false }]);
    };

    // Obtener datos formateados para enviar al backend
    const obtenerEstudiantesParaEnvio = () => {
        return estudiantes.map(est => 
            est.id_estudiante 
                ? { id_estudiante: est.id_estudiante }
                : {
                    nombre_completo: est.nombre_completo,
                    cedula: est.cedula,
                    email: est.email || undefined
                }
        );
    };

    // Devolver todo lo que necesitan otros componentes
    return {
        estudiantes,
        buscando,
        modalVisible,
        resultadoBusqueda,
        agregarEstudiante,
        eliminarEstudiante,
        actualizarEstudiante,
        buscarEstudiantePorCedula,
        usarEstudianteExistente,
        continuarConNuevoEstudiante,
        limpiarEstudiantes,
        obtenerEstudiantesParaEnvio,
        setModalVisible,
    };
};