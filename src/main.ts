import { EmployeeViewModel } from './viewmodels/EmployeeViewModel.js';
import { EmployeeView } from './views/EmployeeView.js';

/**
 * Punto de entrada de la aplicación
 */
class App {
  private viewModel: EmployeeViewModel;
  private view: EmployeeView;

  constructor() {
    this.viewModel = new EmployeeViewModel();
    this.view = new EmployeeView(this.viewModel);
  }

  start(): void {
    console.log('Employee Management App started successfully! 🚀');
  }
}

//Inicializar SOLO cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
