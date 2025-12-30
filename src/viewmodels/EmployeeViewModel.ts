import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/Employee.js';
import { ApiModularis } from '../services/apiModularis.js';

/**
 * Employee ViewModel
 * Maneja la lógica de negocio y conecta la Vista con el Modelo
 */
export class EmployeeViewModel {
  private apiService: ApiModularis;
  private employees: Employee[] = [];
  private currentEmployee: Employee | null = null;
  private isLoading: boolean = false;
  private errorMessage: string = '';

  // Callbacks para actualizar la vista
  private onEmployeesChanged?: (employees: Employee[]) => void;
  private onLoadingChanged?: (isLoading: boolean) => void;
  private onError?: (message: string) => void;
  private onSuccess?: (message: string) => void;

  constructor() {
    this.apiService = new ApiModularis();
  }

  /**
   * Registra callbacks para actualizar la vista
   */
  registerCallbacks(callbacks: {
    onEmployeesChanged?: (employees: Employee[]) => void;
    onLoadingChanged?: (isLoading: boolean) => void;
    onError?: (message: string) => void;
    onSuccess?: (message: string) => void;
  }): void {
    this.onEmployeesChanged = callbacks.onEmployeesChanged;
    this.onLoadingChanged = callbacks.onLoadingChanged;
    this.onError = callbacks.onError;
    this.onSuccess = callbacks.onSuccess;
  }

  /**
   * Establece el estado de carga
   */
  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.onLoadingChanged?.call(this, loading);
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(message: string): void {
    this.errorMessage = message;
    this.onError?.call(this, message);
  }

  /**
   * Muestra un mensaje de éxito
   */
  private showSuccess(message: string): void {
    this.onSuccess?.call(this, message);
  }

  /**
   * Notifica cambios en la lista de empleados
   */
  private notifyEmployeesChanged(): void {
    this.onEmployeesChanged?.call(this, this.employees);
  }

  /**
   * Carga todos los empleados
   */
  async loadEmployees(): Promise<void> {
    this.setLoading(true);
    
    const response = await this.apiService.getAllEmployees();
    
    this.setLoading(false);
    
    if (response.success && response.data) {
      this.employees = response.data;
      this.notifyEmployeesChanged();
    } else {
      this.showError(response.error || 'Failed to load employees');
    }
  }

  /**
   * Carga un empleado específico por ID
   */
  async loadEmployee(id: string): Promise<Employee | null> {
    this.setLoading(true);
    
    const response = await this.apiService.getEmployeeById(id);
    
    this.setLoading(false);
    
    if (response.success && response.data) {
      this.currentEmployee = response.data;
      return response.data;
    } else {
      this.showError(response.error || 'Failed to load employee');
      return null;
    }
  }

  /**
   * Crea un nuevo empleado
   */
  async createEmployee(employeeData: CreateEmployeeDto): Promise<boolean> {
    // Validaciones
    const validation = this.validateEmployeeData(employeeData);
    if (!validation.valid) {
      this.showError(validation.message);
      return false;
    }

    this.setLoading(true);
    
    const response = await this.apiService.createEmployee(employeeData);
    
    this.setLoading(false);
    
    if (response.success) {
      this.showSuccess('Employee created successfully');
      await this.loadEmployees();
      return true;
    } else {
      this.showError(response.error || 'Failed to create employee');
      return false;
    }
  }

  /**
   * Actualiza un empleado existente
   */
  async updateEmployee(id: string, employeeData: UpdateEmployeeDto): Promise<boolean> {
    // Validaciones
    const validation = this.validateEmployeeData(employeeData);
    if (!validation.valid) {
      this.showError(validation.message);
      return false;
    }

    this.setLoading(true);
    
    const response = await this.apiService.updateEmployee(id, employeeData);
    
    this.setLoading(false);
    
    if (response.success) {
      this.showSuccess('Employee updated successfully');
      await this.loadEmployees();
      return true;
    } else {
      this.showError(response.error || 'Failed to update employee');
      return false;
    }
  }

  /**
   * Elimina un empleado
   */
  async deleteEmployee(id: string): Promise<boolean> {
    this.setLoading(true);
    
    const response = await this.apiService.deleteEmployee(id);
    
    this.setLoading(false);
    
    if (response.success) {
      this.showSuccess('Employee removed successfully');
      await this.loadEmployees();
      return true;
    } else {
      this.showError(response.error || 'Failed to delete employee');
      return false;
    }
  }

  /**
   * Valida los datos del empleado
   */
  private validateEmployeeData(data: CreateEmployeeDto | UpdateEmployeeDto): { valid: boolean; message: string } {
    // Validar Employee No (ID)
    if ('employeeNo' in data && data.employeeNo !== undefined) {
      if (!data.employeeNo.trim()) {
        return { valid: false, message: 'ID is required' };
      }
      if (data.employeeNo.trim().length > 8) {
        return { valid: false, message: 'ID must be 8 characters or less' };
      }
    }

    // Validar First Name
    if ('firstName' in data && data.firstName !== undefined) {
      if (!data.firstName.trim()) {
        return { valid: false, message: 'First name is required' };
      }
      if (data.firstName.trim().length < 2) {
        return { valid: false, message: 'First name must be at least 2 characters' };
      }
    }

    // Validar Last Name
    if ('lastName' in data && data.lastName !== undefined) {
      if (!data.lastName.trim()) {
        return { valid: false, message: 'Last name is required' };
      }
      if (data.lastName.trim().length < 2) {
        return { valid: false, message: 'Last name must be at least 2 characters' };
      }
    }

    // Validar SSN
    if ('ssn' in data && data.ssn !== undefined) {
      if (!data.ssn.trim()) {
        return { valid: false, message: 'SSN is required' };
      }
      
      const ssnRegex = /^\d{3}-\d{2}-\d{4}$/;
      if (!ssnRegex.test(data.ssn)) {
        return { valid: false, message: 'SSN must be in format XXX-XX-XXXX (e.g., 123-45-6789)' };
      }
    }

    return { valid: true, message: '' };
  }

  /**
   * Obtiene la lista actual de empleados
   */
  getEmployees(): Employee[] {
    return this.employees;
  }

  /**
   * Obtiene el empleado actual
   */
  getCurrentEmployee(): Employee | null {
    return this.currentEmployee;
  }

  /**
   * Establece el empleado actual
   */
  setCurrentEmployee(employee: Employee | null): void {
    this.currentEmployee = employee;
  }
}