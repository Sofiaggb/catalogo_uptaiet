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
    // const [resultadoBusqueda, setResultadoBusqueda] = useState<ResultadoBusqueda | null>(null);
    const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
    const [buscando, setBuscando] = useState(false);
    const [multipleModalVisible, setMultipleModalVisible] = useState(false);
    const [resultadoBusqueda, setResultadoBusqueda] = useState<any>(null);
    const [resultadosMultiples, setResultadosMultiples] = useState<any[]>([]);

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
        if (!cedula || cedula.length < 3) return;
        
        setBuscando(true);
        setIndiceEditando(index);
        
        try {
            const resultado = await buscarPorCedula('estudiante', cedula);
                    // console.log('res estudiantes', resultado)
            
            if (resultado.success && resultado.data && resultado.data.length > 0) {
                if (resultado.multiple || resultado.data.length > 1) {
                    // Múltiples resultados - mostrar modal de selección
                    setResultadosMultiples(resultado.data);
                    setMultipleModalVisible(true);
                } else {
                    // Un solo resultado - mostrar modal de confirmación
                    // console.log('aqui va uno solo', resultado)
                    setResultadoBusqueda(resultado.data[0]);
                    setModalVisible(true);
                }
            }
            // Si no hay resultados, no hacemos nada (el usuario sigue escribiendo)
            
        } catch (error) {
            console.error('Error buscando estudiante:', error);
        } finally {
            setBuscando(false);
        }
    };

    // Usar estudiante existente (único resultado)
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

    //  Usar estudiante de selección múltiple
    const usarEstudianteMultiple = (estudiante: any) => {
        if (estudiante && indiceEditando !== null) {
            const nuevos = [...estudiantes];
            nuevos[indiceEditando] = {
                id_estudiante: estudiante.id_estudiante,
                nombre_completo: estudiante.nombre_completo,
                cedula: estudiante.cedula,
                email: estudiante.email || '',
                esExistente: true
            };
            setEstudiantes(nuevos);
        }
        setMultipleModalVisible(false);
        setResultadosMultiples([]);
        setIndiceEditando(null);
    };

    // Continuar con nuevo estudiante (ignorar sugerencia)
    const continuarConNuevoEstudiante = () => {
        setModalVisible(false);
        setMultipleModalVisible(false);
        setResultadoBusqueda(null);
        setResultadosMultiples([]);
        setIndiceEditando(null);
    };


    
    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================
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

        multipleModalVisible,
        resultadosMultiples,
        agregarEstudiante,
        eliminarEstudiante,
        actualizarEstudiante,
        buscarEstudiantePorCedula,
        usarEstudianteExistente,
        usarEstudianteMultiple,
        continuarConNuevoEstudiante,
        limpiarEstudiantes,
        obtenerEstudiantesParaEnvio,
        setModalVisible,
    };
};