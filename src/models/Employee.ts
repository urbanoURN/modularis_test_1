/**
 * Employee Model
 * Representa la estructura de datos de un empleado
 */
export interface Employee {
  id: string;              // PersonID de la API
  employeeNo: string;      // EmployeeNo de la API (se muestra en la tabla)
  ssn: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

/**
 * Datos para crear un empleado
 */
export interface CreateEmployeeDto {
  employeeNo: string;      // Ahora es editable por el usuario
  ssn: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

/**
 * Datos para actualizar un empleado
 */
export interface UpdateEmployeeDto {
  employeeNo?: string;     // Ahora es editable por el usuario
  ssn?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

/**
 * Respuesta de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}