import { Locator, Page } from '@playwright/test';

export class AdminPage {
    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Dynamic Getters (Always evaluate against the currently active tab context)
    get addUserLink(): Locator { 
        return this.page.locator('a[href="user.form"]'); 
    }
    get nextButton(): Locator { 
        return this.page.locator('input[value="Next"]').first(); 
    }
    get givenNameInput(): Locator { 
        return this.page.locator('input[name="person.names[0].givenName"]'); 
    }
    get familyNameInput(): Locator { 
        return this.page.locator('input[name="person.names[0].familyName"]'); 
    }
    get genderMaleRadio(): Locator { 
        return this.page.locator('input[id="M"]'); 
    }
    get genderFemaleRadio(): Locator { 
        return this.page.locator('input[id="F"]'); 
    }
    get usernameInput(): Locator { 
        return this.page.locator('input[name="username"]'); 
    }
    get passwordInput(): Locator { 
        return this.page.locator('input[name="userFormPassword"]'); 
    }
    get confirmPasswordInput(): Locator { 
        return this.page.locator('input[name="confirm"]'); 
    }
    get saveUserButton(): Locator { 
        return this.page.locator('input[id="saveButton"]'); 
    }

    async navigateToManageUsers() {
        // 1. Click the App Launcher (waffle menu) icon in the top header
        await this.page.locator('button[aria-label="App Menu"]').click();
        
        // 2. Click Administration from the dropdown menu
        await this.page.locator('text=Administration').click();
        
        // 3. Set up a listener to catch the new tab opening
        const pagePromise = this.page.context().waitForEvent('page');
        
        // 4. Click the "Legacy Admin" card (this triggers the new tab)
        await this.page.locator('text=Legacy Admin').click();
        
        // 5. Wait for the new tab to fully load and assign it to a new variable
        const newTab = await pagePromise;
        await newTab.waitForLoadState();
        
        // 6. Override the default page reference so getters evaluate on this new tab
        this.page = newTab;
    }

    async createUser(givenName: string, familyName: string, gender: 'Male' | 'Female', username: string, pass: string) {
        // 1. Navigate into the user list and start creation workflow
        await this.page.locator('a[href*="users.list"]').click();
        
        // Ensure the legacy DOM tree is completely ready
        await this.addUserLink.waitFor({ state: 'visible' });
        await this.addUserLink.click();       
        await this.nextButton.click();        
        
        // 2. Populate Demographic Block
        await this.givenNameInput.fill(givenName);
        await this.familyNameInput.fill(familyName);
        
        if (gender === 'Male') {
            await this.genderMaleRadio.check();
        } else {
            await this.genderFemaleRadio.check();
        }
        
        // 3. Populate Account Credentials
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(pass);
        await this.confirmPasswordInput.fill(pass);
        
        // 4. Assign structural role assignment
        const roleCheckbox = this.page.locator('input[type="checkbox"][value="System Developer"]');
        await roleCheckbox.scrollIntoViewIfNeeded();
        await roleCheckbox.check();
        
        // 5. Submit form
        await this.saveUserButton.scrollIntoViewIfNeeded();
        await this.saveUserButton.click();
    }
}