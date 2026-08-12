import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { AdminPage } from '../pages/AdminPage';

test.describe('Admin Module Tests', () => {
    let adminPage: AdminPage;
    let loginPage: LoginPage;

   test.beforeEach(async ({ page }) => {
    await page.goto('https://dev3.openmrs.org/openmrs/spa/login'); 
    
    loginPage = new LoginPage(page);
    await loginPage.login('admin', 'Admin123'); 
    

    await page.waitForURL(url => !url.href.includes('/spa/login'), { timeout: 15000 });
    
    adminPage = new AdminPage(page);
    await page.goto('https://dev3.openmrs.org/openmrs/admin/users/users.list');
    await page.waitForLoadState('networkidle');
});

    test('TC_ADM_001 - Create new System User Account', async ({ page }) => {
        await expect(page).toHaveURL(/.*users\.list/);
        
        await adminPage.addUserLink.waitFor({ state: 'visible', timeout: 15000 });
        await expect(adminPage.addUserLink).toBeVisible();

        const uniqueUsername = `nurse_test_${Date.now()}`;
        
        await adminPage.createUser('Jane', 'Doe', 'Female', uniqueUsername, 'Password123!');

        await expect(page).toHaveURL(/.*users\.list/);
        const successBanner = page.locator('text=User Saved');
        await expect(successBanner).toBeVisible({ timeout: 10000 });
    });

    test('TC_ADM_002 - Assign unmatching confirmation password', async ({ page }) => {
    const uniqueUsername = `nurse_fail_${Date.now()}`;
    
    await adminPage.addUserLink.waitFor({ state: 'visible', timeout: 15000 });
    await adminPage.addUserLink.click();       
    await adminPage.nextButton.click();        
    
    await adminPage.givenNameInput.fill('Bad');
    await adminPage.familyNameInput.fill('Password');
    await adminPage.genderFemaleRadio.check();
    await adminPage.usernameInput.fill(uniqueUsername);
    
    await adminPage.passwordInput.fill('Password123!');
    await adminPage.confirmPasswordInput.fill('DifferentPassword456!');
    
    await adminPage.saveUserButton.scrollIntoViewIfNeeded();
    await adminPage.saveUserButton.click();

    const fixErrorsAlert = page.locator('text=Please fix all errors and try again.');
    await expect(fixErrorsAlert).toBeVisible({ timeout: 10000 });
    
    const mismatchMessage = page.locator('text=The provided passwords do not match');
    await expect(mismatchMessage).toBeVisible();
});

test('TC_ADM_003 - Prevent duplicate username registration', async ({ page }) => {
    await page.goto('https://dev3.openmrs.org/openmrs/admin/users/user.form');
    await page.locator('input[value="Next"]').first().click();

    await adminPage.usernameInput.waitFor({ state: 'visible' });
    await adminPage.usernameInput.fill('admin');

    await adminPage.givenNameInput.fill('Test');
    await adminPage.familyNameInput.fill('Admin');
    await adminPage.genderFemaleRadio.check(); 

    await adminPage.passwordInput.fill('ValidPass123!');
    await adminPage.confirmPasswordInput.fill('ValidPass123!');

    await adminPage.saveUserButton.click();

    const duplicateError = page.locator(':has-text("Username or System Id taken")').first();
    await expect(duplicateError).toBeVisible({ timeout: 10000 });
});
});