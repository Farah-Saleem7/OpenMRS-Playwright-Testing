import { Locator, Page } from '@playwright/test';

export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly continueButton: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;

    constructor(page: Page) {
        this.page = page;
        // Locators targeting the modern 3.x Single Page Application (SPA) login interface
        this.usernameInput = page.locator('input#username');
        this.continueButton = page.locator('button:has-text("Continue")');
        this.passwordInput = page.locator('input#password');
        this.loginButton = page.locator('button[type="submit"]');
    }

    async login(username: string, pass: string) {
        // Step 1: Input username and click Continue
        await this.usernameInput.waitFor({ state: 'visible' });
        await this.usernameInput.fill(username);
        await this.continueButton.click();

        // Step 2: Input password and submit the form
        await this.passwordInput.waitFor({ state: 'visible' });
        await this.passwordInput.fill(pass);
        await this.loginButton.click();
        
        // Wait for the main dashboard network transition to settle before proceeding
        await this.page.waitForLoadState('networkidle');
    }
}