import { Page, Locator } from '@playwright/test';

export class RegistrationPage {
    readonly page: Page;
    readonly phoneInput: Locator;
    readonly birthdateInput: Locator;
    readonly validationWarning: Locator;

    constructor(page: Page) {
        this.page = page;
        this.phoneInput = page.locator('input[name="phoneNumber"]');
        this.birthdateInput = page.locator('input[name="birthdate"]');
        this.validationWarning = page.locator('.phone-validation-error, text=Invalid phone format');
    }

    async navigateToRegistration() {
        await this.page.goto('https://dev3.openmrs.org/openmrs/spa/registration');
    }
}