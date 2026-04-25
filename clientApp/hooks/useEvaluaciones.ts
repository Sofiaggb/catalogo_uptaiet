// hooks/useEvaluaciones.ts
import { useState } from 'react';
import { Alert } from 'react-native';
import { buscarPorCedula } from '../services/api';

// ============================================
// INTERFACES

interface Jurado {
    id_jurado?: number;
    nombre_completo: string;
    cedula: string;
    titulo_profesional: string;
    esExistente: boolean;
}

interface Evaluacion {
    nota: string;
    fecha_evaluacion: string;
    comentarios: string;
    jurado: Jurado;
}

interface ResultadoBusquedaJurado {
    id_jurado: number;
    nombre_completo: string;
    cedula: string;
    titulo_profesional: string;
}


export const useEvaluaciones = () => {
    // Estado principal: lista de evaluaciones
    const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([
        {
            nota: '',
            fecha_evaluacion: new Date().toISOString().split('T')[0],
            comentarios: '',
            jurado: { 
                nombre_completo: '', 
                cedula: '', 
                titulo_profesional: '', 
                esExistente: false 
            }
        }
    ]);

    // Estado para el modal (compartido con estudiantes)
    const [modalVisible, setModalVisible] = useState(false);
    const [resultadoBusqueda, setResultadoBusqueda] = useState<ResultadoBusquedaJurado | null>(null);
    const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
    const [buscando, setBuscando] = useState(false);

    // ============================================
    // FUNCIONES PARA EVALUACIONES
    // ============================================

    // Agregar nueva evaluación
    const agregarEvaluacion = () => {
        setEvaluaciones([
            ...evaluaciones,
            {
                nota: '',
                fecha_evaluacion: new Date().toISOString().split('T')[0],
                comentarios: '',
                jurado: { 
                    nombre_completo: '', 
                    cedula: '', 
                    titulo_profesional: '', 
                    esExistente: false 
                }
            }
        ]);
    };

    // Eliminar evaluación por índice
    const eliminarEvaluacion = (index: number) => {
        if (evaluaciones.length === 1) {
            Alert.alert('Error', 'Debe haber al menos una evaluación');
            return;
        }
        const nuevos = [...evaluaciones];
        nuevos.splice(index, 1);
        setEvaluaciones(nuevos);
    };

    // Actualizar campo de una evaluación
    const actualizarEvaluacion = (index: number, campo: keyof Evaluacion, valor: string) => {
        const nuevos = [...evaluaciones];
        nuevos[index] = { ...nuevos[index], [campo]: valor };
        setEvaluaciones(nuevos);
    };

    // Actualizar campo del jurado dentro de una evaluación
    const actualizarJurado = (evalIndex: number, campo: keyof Jurado, valor: string) => {
        const nuevos = [...evaluaciones];
        nuevos[evalIndex].jurado = {
            ...nuevos[evalIndex].jurado,
            [campo]: valor,
            esExistente: false  // Si se modifica, ya no es el existente
        };
        setEvaluaciones(nuevos);
    };

    // ============================================
    // BÚSQUEDA DE JURADO POR CÉDULA
    // ============================================

    const buscarJuradoPorCedula = async (evalIndex: number, cedula: string) => {
        if (!cedula || cedula.length < 5) return;

        setBuscando(true);
        setIndiceEditando(evalIndex);

        try {
            const resultado = await buscarPorCedula('jurado', cedula);
            if (resultado.success && resultado.data) {
                setResultadoBusqueda(resultado.data);
                setModalVisible(true);
            }
        } catch (error) {
            console.error('Error buscando jurado:', error);
        } finally {
            setBuscando(false);
        }
    };

    // Usar jurado existente (confirmar en modal)
    const usarJuradoExistente = () => {
        if (resultadoBusqueda && indiceEditando !== null) {
            const nuevos = [...evaluaciones];
            nuevos[indiceEditando].jurado = {
                id_jurado: resultadoBusqueda.id_jurado,
                nombre_completo: resultadoBusqueda.nombre_completo,
                cedula: resultadoBusqueda.cedula,
                titulo_profesional: resultadoBusqueda.titulo_profesional || '',
                esExistente: true
            };
            setEvaluaciones(nuevos);
        }
        setModalVisible(false);
        setResultadoBusqueda(null);
        setIndiceEditando(null);
    };

    // Continuar con jurado nuevo (cancelar modal)
    const continuarConNuevoJurado = () => {
        setModalVisible(false);
        setResultadoBusqueda(null);
        setIndiceEditando(null);
    };

    // ============================================
    // FUNCIONES AUXILIARES
    // ============================================

    // Limpiar todas las evaluaciones
    const limpiarEvaluaciones = () => {
        setEvaluaciones([
            {
                nota: '',
                fecha_evaluacion: new Date().toISOString().split('T')[0],
                comentarios: '',
                jurado: { 
                    nombre_completo: '', 
                    cedula: '', 
                    titulo_profesional: '', 
                    esExistente: false 
                }
            }
        ]);
    };

    // Obtener datos formateados para enviar al backend
    const obtenerEvaluacionesParaEnvio = () => {
        return evaluaciones.map(ev => {
            let jurado;
            
            if (ev.jurado.id_jurado) {
                // Jurado existente: solo enviar ID
                jurado = { id_jurado: ev.jurado.id_jurado };
            } else {
                // Jurado nuevo: enviar datos completos
                jurado = {
                    nombre_completo: ev.jurado.nombre_completo,
                    cedula: ev.jurado.cedula,
                    titulo_profesional: ev.jurado.titulo_profesional || undefined
                };
            }

            return {
                nota: parseFloat(ev.nota),
                fecha_evaluacion: ev.fecha_evaluacion,
                comentarios: ev.comentarios || undefined,
                jurado
            };
        });
    };

    // Validar que todas las evaluaciones estén completas
    const validarEvaluaciones = () => {
        for (let i = 0; i < evaluaciones.length; i++) {
            const ev = evaluaciones[i];
            if (!ev.nota) {
                return { valido: false, error: `La evaluación ${i + 1} debe tener una nota` };
            }
            if (!ev.jurado.nombre_completo.trim()) {
                return { valido: false, error: `El jurado de la evaluación ${i + 1} debe tener nombre completo` };
            }
            if (!ev.jurado.cedula.trim()) {
                return { valido: false, error: `El jurado de la evaluación ${i + 1} debe tener cédula` };
            }
        }
        return { valido: true, error: null };
    };

    // ============================================
    // RETORNAR TODO LO NECESARIO
    // ============================================

    return {
        // Estado
        evaluaciones,
        buscando,
        modalVisible,
        resultadoBusqueda,
        indiceEditando,
        
        // Acciones de evaluaciones
        agregarEvaluacion,
        eliminarEvaluacion,
        actualizarEvaluacion,
        actualizarJurado,
        limpiarEvaluaciones,
        
        // Acciones de jurados
        buscarJuradoPorCedula,
        usarJuradoExistente,
        continuarConNuevoJurado,
        
        // Utilidades
        obtenerEvaluacionesParaEnvio,
        validarEvaluaciones,
        
        // Setters para el modal
        setModalVisible,
        setResultadoBusqueda,
        setIndiceEditando
    };
};