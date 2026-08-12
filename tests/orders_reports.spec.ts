import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ReportsPage } from '../pages/ReportsPage'; 
import { OrdersPage } from '../pages/OrdersPage';

test.describe('Orders & Reports Tests', () => {
    let loginPage: LoginPage;
    let reportsPage: ReportsPage;
    let ordersPage: OrdersPage;

    test.beforeEach(async ({ page }) => {
        await page.goto('https://dev3.openmrs.org/openmrs/spa/login'); 
        
        loginPage = new LoginPage(page);
        await loginPage.login('admin', 'Admin123'); 
        
        reportsPage = new ReportsPage(page);
        ordersPage = new OrdersPage(page);
    });
test('TC_REP_001 - Download existing report dataset as PDF', async ({ page }) => {
        await page.goto('https://dev3.openmrs.org/openmrs/spa/reports');

        await expect(page.locator('table')).toBeVisible({ timeout: 15000 });

        const downloadBtn = page.getByRole('button', { name: /download/i }).first();
        
        if (await downloadBtn.isVisible().catch(() => false)) {
            const downloadPromise = page.waitForEvent('download');
            await downloadBtn.click();
            const download = await downloadPromise;
            
            const fileName = download.suggestedFilename();
            expect(fileName).toBeTruthy();
            expect(fileName).toMatch(/pdf/i);
        } else {
            console.log('No report datasets currently available for download; skipping execution.');
        }
    });

test('TC_ORD_001 - Book Appointment Workflow', async ({ page }) => {
        await page.goto('https://dev3.openmrs.org/openmrs/spa/home/appointments');

        await page.locator('button.cds--btn--primary', { hasText: 'Create new appointment' }).click();

        await page.getByTestId('patientSearchBar').fill('mk');
        await page.getByRole('button', { name: 'Search', exact: true }).click();

        const patientResult = page.locator('button').filter({ hasText: /Agnes Adams/i }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const serviceSelect = page.locator('select#service');
        await serviceSelect.waitFor({ state: 'visible', timeout: 10000 });
        await serviceSelect.selectOption({ label: 'Rehabilitation service' });
        
        await expect(serviceSelect).toHaveValue('Rehabilitation service');

        const timeInput = page.locator('input#time-picker');
        await timeInput.scrollIntoViewIfNeeded();
        await timeInput.waitFor({ state: 'visible' });
        await timeInput.click();
        
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        
        await timeInput.pressSequentially('09:45'); 
        
        await expect(timeInput).toHaveValue('09:45');

        const durationInput = page.locator('input#duration');
        await durationInput.clear();
        await durationInput.fill('60');
        
        await expect(durationInput).toHaveValue('60');

        await page.evaluate(() => {
            const panel = document.querySelector('aside, form, [class*="side-panel"], [class*="appointment"]');
            if (panel) panel.scrollTop += 800;
            window.scrollBy(0, 800);
        });

        const saveBtn = page.locator('button[type="submit"]', { hasText: 'Save and close' }).first();
        await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
        await saveBtn.click();
        
        const modalContainer = page.locator('div.cds--modal-container');
        await expect(modalContainer).not.toBeVisible({ timeout: 10000 });
    });

 test('TC_ORD_002 - Overbook Conflict Validation Workflow', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('mk');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: 'Agnes Adams' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const appointmentsLink = page.locator('a').filter({ hasText: /^Appointments$/i }).first();
        await appointmentsLink.scrollIntoViewIfNeeded();
        await appointmentsLink.waitFor({ state: 'visible', timeout: 10000 });
        await appointmentsLink.click();

        const addAppointmentBtn = page.locator('button.cds--btn--ghost').filter({ hasText: 'Add' }).first();
        await addAppointmentBtn.scrollIntoViewIfNeeded();
        await addAppointmentBtn.waitFor({ state: 'visible', timeout: 15000 });
        await addAppointmentBtn.click();

        const serviceSelect = page.locator('select#service');
        await serviceSelect.waitFor({ state: 'visible', timeout: 10000 });
        await serviceSelect.selectOption({ label: 'Rehabilitation service' });

        const timeInput = page.locator('input#time-picker');
        await timeInput.scrollIntoViewIfNeeded();
        await timeInput.waitFor({ state: 'visible' });
        await timeInput.click();
        
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await timeInput.pressSequentially('01:03');
        
        await expect(timeInput).toHaveValue('01:03');

        const durationInput = page.locator('input#duration');
        await durationInput.clear();
        await durationInput.fill('60');
        
        await expect(durationInput).toHaveValue('60');

        await page.evaluate(() => {
            const panel = document.querySelector('aside, form, [class*="side-panel"], [class*="appointment"]');
            if (panel) panel.scrollTop += 800;
            window.scrollBy(0, 800);
        });

        const saveBtn = page.locator('button[type="submit"]', { hasText: 'Save and close' }).first();
        await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
        await saveBtn.click();

        const errorToast = page.getByText(/Patient already booked|conflict|overlap/i);
        await expect(errorToast).toBeVisible({ timeout: 8000 });
    });
});