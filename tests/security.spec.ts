import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Role Security & Session Tests', () => {
    let loginPage: LoginPage;

 test('TC_SEC_001 - Prevent unauthorized access to Admin management routes for non-admin role', async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto('https://dev3.openmrs.org/openmrs/spa/login');

    await loginPage.login('nurse', 'Nurse123');

    if (page.url().includes('/login/location')) {
        await page.getByText('Inpatient Ward', { exact: false }).click();
        await page.getByRole('button', { name: 'Confirm' }).click();
    }

    const response = await page.goto('https://dev3.openmrs.org/openmrs/admin/users/user.list');

    const status = response?.status();
    const isBlocked = status === 404 || status === 403 || await page.locator('text=HTTP Status 404').isVisible();
    
    expect(isBlocked).toBeTruthy();
});

    test('TC_SEC_002 - Session expiration upon idle timeout', async ({ page }) => {
        loginPage = new LoginPage(page);
        await page.goto('https://dev3.openmrs.org/openmrs/spa/login');
        await loginPage.login('admin', 'Admin123');

        await page.context().clearCookies();
        await page.evaluate(() => sessionStorage.clear());

        await page.goto('https://dev3.openmrs.org/openmrs/spa/patient-registration');

        await expect(page).toHaveURL(/.*\/login.*/);
    });
});