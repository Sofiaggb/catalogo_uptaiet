import { useState } from 'react';
import { busquedaApi } from '../api/endpoints/busqueda';

interface Estudiante {
  id_estudiante?: number;
  nombre_completo: string;
  cedula: string;
  email: string;
  esExistente: boolean;
}

export const useEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([
    { nombre_completo: '', cedula: '', email: '', esExistente: false }
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [multipleModalVisible, setMultipleModalVisible] = useState(false);
  const [resultadoBusqueda, setResultadoBusqueda] = useState<any>(null);
  const [resultadosMultiples, setResultadosMultiples] = useState<any[]>([]);
  const [indiceEditando, setIndiceEditando] = useState<number | null>(null);
  const [buscando, setBuscando] = useState(false);

  const agregarEstudiante = () => {
    setEstudiantes([
      ...estudiantes,
      { nombre_completo: '', cedula: '', email: '', esExistente: false }
    ]);
  };

  const eliminarEstudiante = (index: number) => {
    if (estudiantes.length === 1) {
      alert('Debe haber al menos un estudiante');
      return;
    }
    const nuevos = [...estudiantes];
    nuevos.splice(index, 1);
    setEstudiantes(nuevos);
  };

  const actualizarEstudiante = (index: number, campo: keyof Estudiante, valor: string) => {
    const nuevos = [...estudiantes];
    nuevos[index] = { ...nuevos[index], [campo]: valor, esExistente: false };
    setEstudiantes(nuevos);
  };

  const buscarEstudiantePorCedula = async (index: number, cedula: string) => {
  if (!cedula || cedula.length < 3) return;
  
  setBuscando(true);
  setIndiceEditando(index);
  
  try {
    const resultado = await busquedaApi.buscarPorCedula('estudiante', cedula);
    
    if (resultado.success && resultado.data && resultado.data.length > 0) {
      if (resultado.multiple || resultado.data.length > 1) {
        setResultadosMultiples(resultado.data);
        setMultipleModalVisible(true);
      } else {
        setResultadoBusqueda(resultado.data[0]);
        setModalVisible(true);
      }
    } else {
      //  No se encontró: limpiar los datos del estudiante
      const nuevos = [...estudiantes];
      nuevos[index] = {
        ...nuevos[index],
        id_estudiante: undefined,
        nombre_completo: '',  // Limpiar nombre
        email: '',            // Limpiar email
        cedula: cedula,       // Mantener la cédula que escribió
        esExistente: false
      };
      setEstudiantes(nuevos);
      
    }
  } catch (error) {
    console.error('Error buscando estudiante:', error);
  } finally {
    setBuscando(false);
  }
};

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

  const continuarConNuevoEstudiante = () => {
    setModalVisible(false);
    setMultipleModalVisible(false);
    setResultadoBusqueda(null);
    setResultadosMultiples([]);
    setIndiceEditando(null);
  };

  return {
    estudiantes,
    buscando,
    modalVisible,
    multipleModalVisible,
    resultadosMultiples,
    resultadoBusqueda,
    setEstudiantes,
    agregarEstudiante,
    eliminarEstudiante,
    actualizarEstudiante,
    buscarEstudiantePorCedula,
    usarEstudianteExistente,
    usarEstudianteMultiple,
    continuarConNuevoEstudiante,
  };
};