import { Employee, CreateEmployeeDto, UpdateEmployeeDto, ApiResponse } from '../models/Employee.js';

/**
 * API Service para Modularis
 * Consume la API REST de HRDemo
 */
export class ApiModularis {
  private readonly BASE_URL = 'https://gateway.modularis.com/HRDemo/RESTActivityWebService/HRDemo.Example/Employees';
  private readonly CUSTOMER_ID = 'C93F949C-41B8-4C9E-95AA-B030B31F6F3F';
  private readonly API_KEY = '3KpOasNPzyAufpKJOoHbixhMIlzcHAPnuw0VIP';

  /**
   * Headers para todas las peticiones
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'CustomerID': this.CUSTOMER_ID,
      'APIKey': this.API_KEY
    };
  }

  /**
   * Convierte datos de Modularis a nuestro modelo
   */
  private toEmployee(data: any): Employee {
    return {
      id: data.PersonID,
      employeeNo: data.EmployeeNo || '',
      ssn: data.SSN || '',
      firstName: data.FirstName || '',
      lastName: data.LastName || '',
      isActive: data.Status === 1
    };
  }

  /**
   * Convierte nuestro modelo a formato Modularis
   */
  private toModularisFormat(employee: CreateEmployeeDto | UpdateEmployeeDto, personId?: string): any {
    const employeeNo = String(Math.floor(Math.random() * 9000) + 1000);
    
    return {
      PersonID: personId || this.generateGuid(),
      FirstName: employee.firstName,
      LastName: employee.lastName,
      SSN: employee.ssn,
      Status: employee.isActive ? 1 : 0,
      EmployeeNo: employeeNo, // Siempre incluir EmployeeNo
      EmploymentStartDate: new Date().toISOString(),
      EmploymentEndDate: null,
      LastUpdatedBy: 'admin',
      LastUpdatedDate: new Date().toISOString()
    };
  }

  /**
   * Genera un GUID único
   */
  private generateGuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * GET - Obtener todos los empleados
   */
  async getAllEmployees(): Promise<ApiResponse<Employee[]>> {
    try {
      console.log('🔄 Fetching employees from API...');
      console.log('URL:', this.BASE_URL);
      
      const response = await fetch(this.BASE_URL, {
        method: 'GET',
        headers: this.getHeaders()
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}. ${errorText}`
        };
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      
      const employees = Array.isArray(data) ? data : (data.value || []);
      
      if (employees.length === 0) {
        console.warn('⚠️ No employees found in the response');
      }
      
      return {
        success: true,
        data: employees.map((emp: any) => this.toEmployee(emp)),
        message: 'Employees retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Network error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection and CORS settings.'
      };
    }
  }

  /**
   * GET - Obtener un empleado por ID
   */
  async getEmployeeById(id: string): Promise<ApiResponse<Employee>> {
    try {
      const url = `${this.BASE_URL}(${id})`;
      console.log('🔄 Fetching employee:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (response.status === 404) {
        return {
          success: false,
          error: `Employee with ID ${id} not found`
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      
      return {
        success: true,
        data: this.toEmployee(data),
        message: 'Employee retrieved successfully'
      };
    } catch (error) {
      console.error('❌ Network error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }

  /**
   * POST - Crear un nuevo empleado
   */
  async createEmployee(employeeData: CreateEmployeeDto): Promise<ApiResponse<Employee>> {
    try {
      const newPersonId = this.generateGuid();
      
      const payload = {
        PersonID: newPersonId,
        FirstName: employeeData.firstName,
        LastName: employeeData.lastName,
        SSN: employeeData.ssn,
        Status: employeeData.isActive ? 1 : 0,
        EmployeeNo: employeeData.employeeNo,  // Usar el valor del usuario
        EmploymentStartDate: new Date().toISOString(),
        EmploymentEndDate: null,
        LastUpdatedBy: 'admin',
        LastUpdatedDate: new Date().toISOString()
      };
      
      console.log('🔄 Creating employee:', payload);

      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        
        if (errorText.includes('duplicate') || errorText.includes('exists')) {
          return {
            success: false,
            error: 'An employee with this SSN already exists'
          };
        }
        
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('✅ Employee created:', data);
      
      return {
        success: true,
        data: this.toEmployee(data),
        message: 'Employee created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating employee:', error);
      return {
        success: false,
        error: 'Failed to create employee'
      };
    }
  }

  /**
   * PUT - Actualizar un empleado
   */
  async updateEmployee(id: string, employeeData: UpdateEmployeeDto): Promise<ApiResponse<Employee>> {
    try {
      const currentResponse = await this.getEmployeeById(id);
      
      if (!currentResponse.success || !currentResponse.data) {
        return {
          success: false,
          error: `Employee with ID ${id} not found`
        };
      }

      const updatedData = {
        ...currentResponse.data,
        ...employeeData
      };
      
      const payload = {
        PersonID: id,
        FirstName: updatedData.firstName,
        LastName: updatedData.lastName,
        SSN: updatedData.ssn,
        Status: updatedData.isActive ? 1 : 0,
        EmployeeNo: updatedData.employeeNo,  // Usar el valor del usuario
        EmploymentStartDate: new Date().toISOString(),
        EmploymentEndDate: null,
        LastUpdatedBy: 'admin',
        LastUpdatedDate: new Date().toISOString()
      };
      
      console.log('🔄 Updating employee:', payload);

      const response = await fetch(this.BASE_URL, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        
        if (errorText.includes('duplicate') || errorText.includes('exists')) {
          return {
            success: false,
            error: 'Another employee with this SSN already exists'
          };
        }
        
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('✅ Employee updated:', data);
      
      return {
        success: true,
        data: this.toEmployee(data),
        message: 'Employee updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating employee:', error);
      return {
        success: false,
        error: 'Failed to update employee'
      };
    }
  }

  /**
   * DELETE - Eliminar un empleado
   */
  async deleteEmployee(id: string): Promise<ApiResponse<null>> {
    try {
      const url = `${this.BASE_URL}(${id})`;
      console.log('🔄 Deleting employee:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (response.status === 404) {
        return {
          success: false,
          error: `Employee with ID ${id} not found`
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        return {
          success: false,
          error: `Error ${response.status}: ${response.statusText}`
        };
      }

      console.log('✅ Employee deleted successfully');
      
      return {
        success: true,
        data: null,
        message: 'Employee deleted successfully'
      };
    } catch (error) {
      console.error('❌ Error deleting employee:', error);
      return {
        success: false,
        error: 'Failed to delete employee'
      };
    }
  }
}