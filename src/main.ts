import { EmployeeViewModel } from './viewmodels/EmployeeViewModel.js';
import { EmployeeView } from './views/EmployeeView.js';


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

//Initialize ONLY when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
