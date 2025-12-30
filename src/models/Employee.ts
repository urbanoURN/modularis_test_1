/**
 * Employee Model
 * Represents the data structure of an employee
 */
export interface Employee {
  id: string;              
  employeeNo: string;      
  ssn: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

/**
 * Data to create an employee
 */
export interface CreateEmployeeDto {
  employeeNo: string;      
  ssn: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

/**
 * Data to maintain an employee
 */
export interface UpdateEmployeeDto {
  employeeNo?: string;     
  ssn?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

/**
 * API Response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}