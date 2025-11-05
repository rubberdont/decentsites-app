import { showError } from './toast';

export enum ErrorSeverity {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export enum ErrorCategory {
  API = 'api',
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTH = 'auth',
  GENERAL = 'general'
}

export interface LogEntry {
  timestamp: string;
  level: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  error?: any;
  userMessage?: string;
  context?: any;
}

export interface ParsedError {
  status?: number;
  message: string;
  userMessage?: string;
  details?: any;
}

/**
 * Logs an error with structured format and optional user notification
 */
export function logError(entry: LogEntry): void {
  const isDev = process.env.NODE_ENV === 'development';

  // Always log errors, and in dev mode log warnings and info too
  if (entry.level === ErrorSeverity.ERROR ||
      (isDev && (entry.level === ErrorSeverity.WARN || entry.level === ErrorSeverity.INFO))) {
    console.error(`[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.category}]: ${entry.message}`, entry.error || '');
  }

  // Show user notification for errors with userMessage
  if (entry.userMessage && entry.level === ErrorSeverity.ERROR) {
    showError(entry.userMessage);
  }
}

/**
 * Logs API-related errors with automatic parsing
 */
export function logApiError(error: any, context?: any): void {
  const parsed = parseApiError(error);

  logError({
    timestamp: new Date().toISOString(),
    level: ErrorSeverity.ERROR,
    category: ErrorCategory.API,
    message: parsed.message,
    error,
    userMessage: parsed.userMessage,
    context
  });
}

/**
 * Logs validation errors
 */
export function logValidationError(message: string, error?: any, context?: any): void {
  logError({
    timestamp: new Date().toISOString(),
    level: ErrorSeverity.ERROR,
    category: ErrorCategory.VALIDATION,
    message,
    error,
    userMessage: 'Please check your input and try again.',
    context
  });
}

/**
 * Logs network-related errors
 */
export function logNetworkError(error: any, context?: any): void {
  logError({
    timestamp: new Date().toISOString(),
    level: ErrorSeverity.ERROR,
    category: ErrorCategory.NETWORK,
    message: 'Network request failed',
    error,
    userMessage: 'Network error. Please check your connection and try again.',
    context
  });
}

/**
 * Logs authentication errors
 */
export function logAuthError(message: string, error?: any, context?: any): void {
  logError({
    timestamp: new Date().toISOString(),
    level: ErrorSeverity.ERROR,
    category: ErrorCategory.AUTH,
    message,
    error,
    userMessage: 'Authentication failed. Please log in again.',
    context
  });
}

/**
 * Logs general application errors
 */
export function logGeneralError(message: string, error?: any, userMessage?: string, context?: any): void {
  logError({
    timestamp: new Date().toISOString(),
    level: ErrorSeverity.ERROR,
    category: ErrorCategory.GENERAL,
    message,
    error,
    userMessage,
    context
  });
}

/**
 * Parses common API error responses
 */
export function parseApiError(error: any): ParsedError {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          status,
          message: 'Bad request',
          userMessage: 'Invalid request. Please check your input.',
          details: data
        };
      case 401:
        return {
          status,
          message: 'Unauthorized',
          userMessage: 'Please log in to continue.',
          details: data
        };
      case 403:
        return {
          status,
          message: 'Forbidden',
          userMessage: 'You do not have permission to perform this action.',
          details: data
        };
      case 404:
        return {
          status,
          message: 'Not found',
          userMessage: 'The requested resource was not found.',
          details: data
        };
      case 422:
        return {
          status,
          message: 'Validation error',
          userMessage: 'Please check your input and try again.',
          details: data
        };
      case 429:
        return {
          status,
          message: 'Too many requests',
          userMessage: 'Too many requests. Please wait a moment and try again.',
          details: data
        };
      case 500:
        return {
          status,
          message: 'Internal server error',
          userMessage: 'Something went wrong on our end. Please try again later.',
          details: data
        };
      default:
        return {
          status,
          message: `HTTP ${status} error`,
          userMessage: 'An error occurred. Please try again.',
          details: data
        };
    }
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error - no response received',
      userMessage: 'Network error. Please check your connection and try again.',
      details: error.request
    };
  } else {
    // Other error
    return {
      message: error.message || 'Unknown error',
      userMessage: 'An unexpected error occurred.',
      details: error
    };
  }
}

/**
 * Logs warnings (development mode only for console, no user notification)
 */
export function logWarning(message: string, context?: any): void {
  logError({
    timestamp: new Date().toISOString(),
    level: ErrorSeverity.WARN,
    category: ErrorCategory.GENERAL,
    message,
    context
  });
}

/**
 * Logs info messages (development mode only)
 */
export function logInfo(message: string, context?: any): void {
  logError({
    timestamp: new Date().toISOString(),
    level: ErrorSeverity.INFO,
    category: ErrorCategory.GENERAL,
    message,
    context
  });
}