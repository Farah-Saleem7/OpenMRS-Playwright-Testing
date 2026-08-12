# OpenMRS Playwright Testing

End-to-end test automation project for the **OpenMRS** healthcare application, built with Playwright and TypeScript.

The project focuses on validating important application workflows through automated browser testing, with an emphasis on reliable test execution, clear assertions, and maintainable test structure.

## Overview

This project is designed to automate and validate key OpenMRS user workflows, including:

* User authentication
* Application navigation
* Patient-related workflows
* Form interactions
* Data validation
* UI behavior
* End-to-end scenarios

The tests simulate real user interactions to help verify that critical application functionality behaves as expected.

## Tech Stack

* **Playwright**
* **TypeScript**
* **Node.js**
* **Playwright Test**
* **Git & GitHub**

## Project Structure

```text
OpenMRS-Playwright-Testing/
│
├── tests/
│   ├── ...
│
├── playwright.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Git

Verify the installation:

```bash
node --version
npm --version
```

### Installation

Clone the repository:

```bash
git clone https://github.com/Farah-Saleem7/OpenMRS-Playwright-Testing.git
```

Navigate to the project directory:

```bash
cd OpenMRS-Playwright-Testing
```

Install the project dependencies:

```bash
npm install
```

Install Playwright browsers:

```bash
npx playwright install
```

## Running Tests

Run the complete test suite:

```bash
npx playwright test
```

Run tests in headed mode:

```bash
npx playwright test --headed
```

Run a specific test file:

```bash
npx playwright test tests/example.spec.ts
```

Run tests using a specific browser:

```bash
npx playwright test --project=chromium
```

## Test Reports

After running the tests, generate and open the Playwright report with:

```bash
npx playwright show-report
```

The report can provide:

* Test results
* Execution duration
* Failed test details
* Screenshots
* Traces
* Browser execution information

## Testing Approach

The project follows a structured end-to-end testing approach:

1. Identify the user workflow to be tested.
2. Navigate through the application.
3. Locate and interact with UI elements.
4. Validate expected behavior using assertions.
5. Capture relevant information when tests fail.
6. Keep test cases independent and maintainable.

## Configuration

Playwright settings are managed through:

```text
playwright.config.ts
```

The configuration can be used to manage:

* Test directory
* Base URL
* Browser projects
* Timeouts
* Retries
* Reporting
* Parallel execution

## Automation Practices

The project follows practical automation principles including:

* Stable element locators
* Clear test descriptions
* Independent test cases
* Meaningful assertions
* Reusable test logic
* Maintainable test structure
* Separation of configuration and test logic

## Author

**Farah Saleem**

Quality Assurance | Manual Testing | Test Automation

* GitHub: https://github.com/Farah-Saleem7
* LinkedIn: https://www.linkedin.com/in/farah-a-saleem
* Email: [fara7.saleem@gmail.com](mailto:fara7.saleem@gmail.com)

---

A practical QA automation project focused on end-to-end testing of OpenMRS using Playwright and TypeScript.
