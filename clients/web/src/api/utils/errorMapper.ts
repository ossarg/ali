import { AxiosError } from 'axios';
import { ERROR_CODES, ApiErrorResponse, ErrorCode } from './errorCodes';

const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Credenciales inválidas.',
  [ERROR_CODES.UNAUTHORIZED]: 'No autorizado. Iniciá sesión nuevamente.',
  [ERROR_CODES.FORBIDDEN]: 'No tenés permisos para realizar esta acción.',
  [ERROR_CODES.TOKEN_EXPIRED]: 'Tu sesión expiró. Iniciá sesión nuevamente.',
  [ERROR_CODES.VALIDATION_ERROR]: 'Los datos enviados son inválidos.',
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: 'Error del servidor. Intentá más tarde.',
  [ERROR_CODES.NETWORK_ERROR]: 'Sin conexión. Verificá tu red.',
  [ERROR_CODES.TIMEOUT]: 'La solicitud tardó demasiado. Intentá de nuevo.',
  [ERROR_CODES.UNKNOWN]: 'Ocurrió un error inesperado.',
};

export const mapApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data?.code && data.code in ERROR_MESSAGES) {
      return ERROR_MESSAGES[data.code as ErrorCode];
    }

    if (!error.response) {
      if (error.code === 'ECONNABORTED') return ERROR_MESSAGES[ERROR_CODES.TIMEOUT];
      return ERROR_MESSAGES[ERROR_CODES.NETWORK_ERROR];
    }

    switch (status) {
      case 400: return ERROR_MESSAGES[ERROR_CODES.VALIDATION_ERROR];
      case 401: return ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED];
      case 403: return ERROR_MESSAGES[ERROR_CODES.FORBIDDEN];
      case 500:
      case 502:
      case 503:
      case 504: return ERROR_MESSAGES[ERROR_CODES.INTERNAL_SERVER_ERROR];
    }
  }

  return ERROR_MESSAGES[ERROR_CODES.UNKNOWN];
};
