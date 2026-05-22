import Swal from 'sweetalert2';

export const showSuccessAlert = (message: string, onConfirm?: () => void) => {
  Swal.fire({
    icon: 'success',
    title: '¡Éxito!',
    text: message,
    confirmButtonColor: '#06b6d4',
    confirmButtonText: 'OK'
  }).then(() => {
    if (onConfirm) onConfirm();
  });
};

export const showErrorAlert = (message: string) => {
  Swal.fire({
    icon: 'error',
    title: '¡Error!',
    text: message,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'OK'
  });
};

export const showWarningAlert = (message: string, onConfirm?: () => void) => {
  Swal.fire({
    icon: 'warning',
    title: '¡Atención!',
    text: message,
    confirmButtonColor: '#f59e0b',
    confirmButtonText: 'OK'
  }).then(() => {
    if (onConfirm) onConfirm();
  });
};

export const showConfirmAlert = async (title: string, message: string): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text: message,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#06b6d4',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, continuar',
    cancelButtonText: 'Cancelar'
  });
  return result.isConfirmed;
};