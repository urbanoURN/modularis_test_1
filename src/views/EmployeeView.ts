import { Employee } from '../models/Employee.js';
import { EmployeeViewModel } from '../viewmodels/EmployeeViewModel.js';

/**
 * Employee View
 * Handles user interface and interactions
 */
export class EmployeeView {
  private viewModel: EmployeeViewModel;
  private currentView: 'list' | 'form' = 'list';
  private isEditMode: boolean = false;
  private editingEmployeeId: string | null = null;

  constructor(viewModel: EmployeeViewModel) {
    this.viewModel = viewModel;
    this.initialize();
  }

  /**
   * Initializes the view and logs events
   */
  private initialize(): void {
    this.viewModel.registerCallbacks({
      onEmployeesChanged: this.renderEmployeeList.bind(this),
      onLoadingChanged: this.handleLoadingState.bind(this),
      onError: this.showErrorMessage.bind(this),
      onSuccess: this.showSuccessMessage.bind(this)
    });

    this.registerEvents();

    // Load employees initially
    this.viewModel.loadEmployees();
  }

  /**
   * Register all event listeners
   */
  private registerEvents(): void {
    // Title “Employees” - Back to top and refresh
    const titleLink = document.getElementById('title-link');
    titleLink?.addEventListener('click', () => {
      this.showList();
      this.viewModel.loadEmployees();
    });

    // Breadcrumb “Employee” - Back to top and refresh
    const breadcrumbHome = document.getElementById('breadcrumb-home');
    breadcrumbHome?.addEventListener('click', () => {
      this.showList();
      this.viewModel.loadEmployees();
    });

    // Botón "New Employee"
    const newEmployeeBtn = document.getElementById('new-employee-btn');
    newEmployeeBtn?.addEventListener('click', () => this.showForm(false));
    
    // Botón "New Employee" FAB
    const newEmployeeBtnFab = document.getElementById('fab-new-employee');
    newEmployeeBtnFab?.addEventListener('click', () => this.showForm(false));

    // Botón "Save" of form
    const saveBtn = document.getElementById('save-btn');
    saveBtn?.addEventListener('click', () => this.handleSave());

    // Botón "Cancel" of the confirmation mode
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    cancelDeleteBtn?.addEventListener('click', () => this.hideDeleteModal());

    // Botón "Yes, Remove" of the confirmation mode
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    confirmDeleteBtn?.addEventListener('click', () => this.confirmDelete());

    // Format SSN automatically while typing
    const ssnInput = document.getElementById('ssn-input') as HTMLInputElement;
    ssnInput?.addEventListener('input', (e) => this.formatSSN(e));
  }

  /**
   * Format SSN automatically (XXX-XX-XXXX)
   */
  private formatSSN(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); //  Remove all but digits
    
    if (value.length > 9) {
      value = value.substring(0, 9);
    }
    
    if (value.length > 5) {
      value = `${value.substring(0, 3)}-${value.substring(3, 5)}-${value.substring(5)}`;
    } else if (value.length > 3) {
      value = `${value.substring(0, 3)}-${value.substring(3)}`;
    }
    
    input.value = value;
  }

  /**
   * Render the list of employees
   */
  private renderEmployeeList(employees: Employee[]): void {
    const tbody = document.getElementById('employees-tbody');
    
    if (!tbody) return;

    if (employees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
            No employees found. Click "New Employee" to add one.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = employees.map(employee => `
      <tr>
        <td data-label="ID">${this.escapeHtml(employee.employeeNo)}</td>
        <td data-label="FIRST NAME">${this.escapeHtml(employee.firstName)}</td>
        <td data-label="LAST NAME">${this.escapeHtml(employee.lastName)}</td>
        <td data-label="STATUS">
          <span class="status-badge ${employee.isActive ? 'active' : 'inactive'}">
            ${employee.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </td>
        <td data-label="ACTIONS" class="actions-cell">
          <div class="actions-aline-end">
            <button class="action-btn edit-btn" data-id="${employee.id}" title="Edit">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="action-btn delete-btn" data-id="${employee.id}" title="Delete">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    this.registerActionButtons();
  }

  /**
   * Logs edit and delete button eventsr
   */
  private registerActionButtons(): void {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) this.handleEdit(id);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).dataset.id;
        if (id) this.handleDelete(id);
      });
    });
  }

  /**
   * Displays the form to create or edit
   */
  private showForm(isEdit: boolean, employee?: Employee): void {
    this.currentView = 'form';
    this.isEditMode = isEdit;

    const listView = document.getElementById('list-view');
    const formView = document.getElementById('form-view');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    const formTitle = document.getElementById('form-title');
    const fab = document.getElementById('fab-new-employee');


    listView?.classList.add('hidden');
    formView?.classList.remove('hidden');
    fab?.classList.add('hidden');


    if (isEdit && employee) {
      this.editingEmployeeId = employee.id;
      if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = ` > ${employee.firstName} ${employee.lastName}`;
      }
      if (formTitle) {
        formTitle.textContent = 'Edit Employee';
      }
      this.fillForm(employee);
    } else {
      this.editingEmployeeId = null;
      if (breadcrumbCurrent) {
        breadcrumbCurrent.textContent = ' > New Employee';
      }
      if (formTitle) {
        formTitle.textContent = 'New Employee';
      }
      this.clearForm();
    }
  }

  /**
   *Displays the list view
   */
  private showList(): void {
    this.currentView = 'list';
    const listView = document.getElementById('list-view');
    const formView = document.getElementById('form-view');
    const fab = document.getElementById('fab-new-employee');

    

    listView?.classList.remove('hidden');
    formView?.classList.add('hidden');
    fab?.classList.remove('hidden');


    this.clearForm();
  }

  /**
   * Fill in the form with employee data
   */
  private fillForm(employee: Employee): void {
    (document.getElementById('first-name-input') as HTMLInputElement).value = employee.firstName;
    (document.getElementById('last-name-input') as HTMLInputElement).value = employee.lastName;
    (document.getElementById('id-input') as HTMLInputElement).value = employee.employeeNo;
    (document.getElementById('ssn-input') as HTMLInputElement).value = employee.ssn;
    (document.getElementById('active-checkbox') as HTMLInputElement).checked = employee.isActive;
  }

  /**
   * Clean of the form
   */
  private clearForm(): void {
    (document.getElementById('first-name-input') as HTMLInputElement).value = '';
    (document.getElementById('last-name-input') as HTMLInputElement).value = '';
    (document.getElementById('id-input') as HTMLInputElement).value = '';
    (document.getElementById('ssn-input') as HTMLInputElement).value = '';
    (document.getElementById('active-checkbox') as HTMLInputElement).checked = true;
  }


  private async handleEdit(id: string): Promise<void> {
    const employee = await this.viewModel.loadEmployee(id);
    if (employee) {
      this.showForm(true, employee);
    }
  }

  /**
   *  Handles the save event
   */
  private async handleSave(): Promise<void> {
    const firstName = (document.getElementById('first-name-input') as HTMLInputElement).value.trim();
    const lastName = (document.getElementById('last-name-input') as HTMLInputElement).value.trim();
    const employeeNo = (document.getElementById('id-input') as HTMLInputElement).value.trim();
    const ssn = (document.getElementById('ssn-input') as HTMLInputElement).value.trim();
    const isActive = (document.getElementById('active-checkbox') as HTMLInputElement).checked;

    const employeeData = {
      firstName,
      lastName,
      employeeNo,
      ssn,
      isActive
    };

    let success = false;

    if (this.isEditMode && this.editingEmployeeId) {
      success = await this.viewModel.updateEmployee(this.editingEmployeeId, employeeData);
    } else {
      success = await this.viewModel.createEmployee(employeeData);
    }

    if (success) {
      this.showList();
    }
  }

  /**
   * Handles the delete event (modal display)
   */
  private handleDelete(id: string): void {
    this.editingEmployeeId = id;
    this.showDeleteModal();
  }

  /**
   * Confirms the elimination
   */
  private async confirmDelete(): Promise<void> {
    if (this.editingEmployeeId) {
      await this.viewModel.deleteEmployee(this.editingEmployeeId);
      this.editingEmployeeId = null;
      this.hideDeleteModal();
    }
  }

  /**
   * Displays the deletion confirmation modal
   */
  private showDeleteModal(): void {
    const modal = document.getElementById('delete-modal');
    modal?.classList.remove('hidden');
  }

  /**
   * Hidess the deletion confirmation modal
   */
  private hideDeleteModal(): void {
    const modal = document.getElementById('delete-modal');
    modal?.classList.add('hidden');
  }


  private handleLoadingState(isLoading: boolean): void {
    const loader = document.getElementById('loader');
    if (isLoading) {
      loader?.classList.remove('hidden');
    } else {
      loader?.classList.add('hidden');
    }
  }

 
  private showErrorMessage(message: string): void {
    this.showToast(message, 'error');
  }


  private showSuccessMessage(message: string): void {
    this.showToast(message, 'success');
  }

  /**
   * Displays a toast notification
   */
  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  /**
   * HTML escaping to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}