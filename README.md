## Summary

A complete employee management system was implemented using TypeScript
and the MVVM (Model-View-ViewModel) architectural pattern, connected
to the Modularis HRDemo REST API.

The application allows CRUD operations (Create, Read, Update, Delete)
on employees, with a responsive interface that perfectly adapts to
mobile devices, tablets, and desktops.

The ID field (EmployeeNo) was implemented as a user-editable
identifier, while the system internally manages the PersonID as an
automatically generated primary key.

---

## What Was Done

A Single Page Application (SPA) was developed without using frameworks
like React or Angular.

Main features:

- Employee list in table view
- Create employee with validated form
- Edit existing employee
- Delete employee with confirmation
- Editable ID field (EmployeeNo)
- SSN validation with AAA-GG-SSSS format
- Responsive design for all devices
- Floating button on mobile (FAB)
- Robust error handling
- Visual loading states

---

## Architecture

The solution is organized following the MVVM pattern:

# Model
Defines interfaces and data structures.

- Employee.ts

    # Main structure:
    - id: string              // PersonID - internal primary key
    - employeeNo: string      // User-visible and editable ID
    - ssn: string             // Social Security Number
    - firstName: string       // First name
    - lastName: string        // Last name
    - isActive: boolean       // Active/inactive status

Important note about ID:
    The "id" field corresponds to the API's PersonID (automatically
    generated GUID). The "employeeNo" field is the user-visible ID, editable, and displayed in the main table.

# View
Handles the user interface and interactions.

- EmployeeView.ts
- index.html
- styles.css

Responsibilities:

    - Render employee list
    - Manage creation and editing forms
    - Handle user events
    - Display toast notifications
    - Control confirmation modals

# ViewModel
Connects the Model with the View and handles business logic.

- EmployeeViewModel.ts

Responsibilities:

    - Validate input data
    - Coordinate API calls
    - Manage loading states
    - Notify changes to the View
    - Handle errors

# API Service
Handles communication with the Modularis REST API.

- apiModularis.ts

Responsibilities:

    - Perform HTTP requests (GET, POST, PUT, DELETE)
    - Transform data between internal and API formats
    - Handle responses and errors
    - Manage authentication headers

    # Field mapping:
        - employeeNo → EmployeeNo  (Editable ID)
        - firstName → FirstName
        - lastName → LastName
        - ssn → SSN
        - isActive → Status (0 or 1)

---

## Design Patterns Used

- MVVM Separates presentation logic from business logic.
- Observer The ViewModel notifies changes to the View through callbacks.
- Strategy Validation methods can be extended without modifying existing code.

---

## SOLID Principles Applied

- Single Responsibility Principle Each class has a single responsibility.
<!-- - Open/Closed Principle The system is open for extension but closed for modification. --> you should modify some .TS files 
- Dependency Inversion Principle The ViewModel depends on abstractions rather than concrete implementations.

---

## Implemented Validations

ID Field (EmployeeNo):
    - Required
    - Maximum 8 characters
    - Alphanumeric
SSN Field:
    - Required
    - Format AAA-GG-SSSS
    - Auto-formatting while typing
Name Fields:
    - Required
    - Minimum 2 characters

---

## Responsive Design

Desktop (greater than 768px):
    - Full table with all columns
    - "NEW EMPLOYEE" button in header

Tablet (480px - 768px):
    - Adaptive table
    - Single-column forms

Mobile (less than 480px):
    - Table with horizontal scroll keeping all columns
    - Circular floating button (+) to create employee
    - Optimized toast notifications
    - Compact but visible columns

---

## API Configuration
Base Endpoint:
https://gateway.modularis.com/HRDemo/RESTActivityWebService/HRDemo.Example/Employees

Required Headers:
    - Content-Type: application/json
    - CustomerID: C93F949C-41B8-4C9E-95AA-B030B31F6F3F
    - APIKey: (configured in apiModularis.ts)

Operations:
    - GET /Employees - List all
    - GET /Employees(PersonID) - Get one
    - POST /Employees - Create new
    - PUT /Employees - Update existing
    - DELETE /Employees(PersonID) - Delete

---

## Installation
Prerequisites:
    - Node.js v14+
    - npm

Steps:
    - npm install
    - npm run build
    - npm run serve
            OR 
    - npm install
    - npm run dev
Open in browser: http://localhost:8080

Available commands:
    - npm run build: Compiles TypeScript
    - npm run watch: Compiles in watch mode
    - npm run serve: Starts local server
    - npm run dev: Build + Serve

---

Project Structure
    employee-management-system/
    ├── index.html
    ├── styles.css
    ├── package.json
    ├── tsconfig.json
    ├── README.md
    └── src/
    ├── models/
    │   └── Employee.ts
    ├── services/
    │   └── apiModularis.ts
    ├── viewmodels/
    │   └── EmployeeViewModel.ts
    ├── views/
    │   └── EmployeeView.ts
    └── main.ts

---

## Technologies

TypeScript 5.3+
HTML5
CSS3
Fetch API
ES6 Modules
Vanilla JavaScript (no frameworks)

