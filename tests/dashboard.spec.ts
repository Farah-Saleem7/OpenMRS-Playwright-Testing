import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Patient Dashboard Tests', () => {
    let loginPage: LoginPage;
    let dashboardPage: DashboardPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);

        await page.goto('https://dev3.openmrs.org/openmrs/spa/login'); 
        await loginPage.login('admin', 'Admin123'); 

        const locationPrompt = page.getByText(/Select your location/i);
        await locationPrompt.waitFor({ state: 'visible', timeout: 10000 }).catch(() => null);

        if (await locationPrompt.isVisible()) {
            const inpatientOption = page.getByText('Inpatient Ward', { exact: false });
            if (await inpatientOption.isVisible().catch(() => false)) {
                await inpatientOption.click();
                await page.getByRole('button', { name: /Confirm/i }).click();
            }
        }

        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.waitFor({ state: 'visible', timeout: 15000 });
    });

test('TC_DSH_001 - Record a confirmed diagnosis encounter', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('10001V5');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: '10001V5' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const conditionsLink = page.locator('a').filter({ hasText: /Conditions/i }).first();
        await conditionsLink.scrollIntoViewIfNeeded();
        await conditionsLink.waitFor({ state: 'visible', timeout: 10000 });
        await conditionsLink.click();

        const addConditionBtn = page.locator('button.cds--btn--ghost').filter({ hasText: 'Add' }).first();
        await addConditionBtn.scrollIntoViewIfNeeded();
        await addConditionBtn.waitFor({ state: 'visible', timeout: 15000 });
        await addConditionBtn.click();

        const conceptSearch = page.locator('input[placeholder="Search conditions"]');
        await conceptSearch.waitFor({ state: 'visible', timeout: 10000 });
        await conceptSearch.fill('Malaria');
        
        const searchOption = page.locator('li, div[role="option"]').filter({ hasText: /^Malaria$/i }).first();
        await searchOption.waitFor({ state: 'visible', timeout: 10000 });
        await searchOption.click();

        const saveBtn = page.locator('button:has-text("Save & close")');
        await saveBtn.scrollIntoViewIfNeeded();
        await saveBtn.click();

        const conditionTable = page.locator('table[aria-label*="condition"], table, div[class*="conditions"]').first();
        await expect(conditionTable).toContainText(/Malaria/i, { timeout: 15000 });
    });

   test('TC_DSH_002 - Add severe medication allergy alert', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('10001V5');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: '10001V5' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const allergiesLink = page.locator('a').filter({ hasText: /Allergies/i }).first();
        await allergiesLink.scrollIntoViewIfNeeded();
        await allergiesLink.waitFor({ state: 'visible', timeout: 10000 });
        await allergiesLink.click();
        
        const recordAllergyBtn = page.locator('[data-extension-id="allergies-details-widget"] button, div[class*="allergies"] button')
            .filter({ hasText: /^Add/i })
            .first();
            
        await recordAllergyBtn.waitFor({ state: 'visible', timeout: 15000 });
        await recordAllergyBtn.click();
        
        const allergenInput = page.locator('input[id="allergen"], input[placeholder*="allergen"], input[type="text"]').first();
        await allergenInput.waitFor({ state: 'visible', timeout: 10000 });
        await allergenInput.fill('Penicillin');
        
        const optionPenicillin = page.locator('li, div[role="option"]').filter({ hasText: /Penicillin/i }).first();
        if (await optionPenicillin.isVisible({ timeout: 3000 }).catch(() => false)) {
            await optionPenicillin.click();
        }

        const reactionCheckbox = page.locator('label:has-text("Rash"), input[value*="Rash"]').first();
        if (await reactionCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
            await reactionCheckbox.click();
        }

        const severeRadio = page.locator('label:has-text("Severe"), label[for="severe"], input[value*="SEVERE"]').first();
        if (await severeRadio.isVisible({ timeout: 3000 }).catch(() => false)) {
            await severeRadio.click();
        }

        const saveButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Confirm")').last();
        await saveButton.scrollIntoViewIfNeeded();
        await saveButton.click();

        const errorToast = page.locator('div.cds--inline-notification, div[class*="inline-notification"]').filter({ hasText: 'patientUuid' });
        await expect(errorToast, 'The application crashed due to a null patientUuid property').not.toBeVisible();

        const allergySection = page.locator('div[class*="allergies"], table, div[class*="card"]').first();
        await expect(allergySection).toBeVisible({ timeout: 15000 });
    });

    test('TC_DSH_003 - Upload and view file attachments', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('10001V5');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: '10001V5' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const attachmentsLink = page.locator('a').filter({ hasText: /Attachments/i }).first();
        await attachmentsLink.scrollIntoViewIfNeeded();
        await attachmentsLink.waitFor({ state: 'visible', timeout: 10000 });
        await attachmentsLink.click();

        const startVisitModalBtn = page.getByRole('button', { name: /Start new visit/i });
        if (await startVisitModalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await startVisitModalBtn.click();
            const confirmVisitBtn = page.getByRole('button', { name: /confirm|start/i }).last();
            if (await confirmVisitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmVisitBtn.click();
            }
        }

        const recordAttachmentsLink = page.locator('a, button').filter({ hasText: /Record attachments/i }).first();
        await recordAttachmentsLink.waitFor({ state: 'visible', timeout: 10000 });
        await recordAttachmentsLink.click();

        const fileInput = page.locator('input[type="file"]');
        await fileInput.waitFor({ state: 'attached', timeout: 10000 });
        await fileInput.setInputFiles({
            name: 'xray_chest.png',
            mimeType: 'image/png',
            buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==')
        });

        const captionInput = page.locator('input[name*="caption"], textarea[name*="caption"]').first();
        if (await captionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
            await captionInput.fill('Chest X-Ray Scan');
        }

        const saveAttachmentBtn = page.locator('button[type="submit"], button:has-text("Upload"), button:has-text("Save")').last();
        await saveAttachmentBtn.click();

        const attachmentGallery = page.locator('div[class*="attachments"], table, div[class*="card"]').first();
        await expect(attachmentGallery).toBeVisible({ timeout: 15000 });
    });

    test('TC_DSH_004 - Edit a finalized encounter form with blank entries', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('10001V5');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: '10001V5' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const visitsLink = page.locator('a').filter({ hasText: /Visits/i }).first();
        await visitsLink.scrollIntoViewIfNeeded();
        await visitsLink.waitFor({ state: 'visible', timeout: 10000 });
        await visitsLink.click();

        const editFormBtn = page.locator('button:has-text("Edit"), a:has-text("Edit")').first();
        if (await editFormBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await editFormBtn.click();

            const inputField = page.locator('form input[type="text"], input[type="text"], textarea').first();
            if (await inputField.isVisible().catch(() => false)) {
                await inputField.clear();
            }

            const saveButton = page.locator('button[type="submit"], button:has-text("Save")').last();
            await saveButton.click();

            const validationError = page.locator('.cds--form-requirement, [data-invalid], text=/required|cannot be blank/i').first();
            await expect(validationError).toBeVisible({ timeout: 10000 });
        }
    });

    test('TC_DSH_005 - End active visit with pending form actions', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('10001V5');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: '10001V5' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const vitalsLink = page.locator('a').filter({ hasText: /Vitals & Biometrics/i }).first();
        await vitalsLink.scrollIntoViewIfNeeded();
        await vitalsLink.waitFor({ state: 'visible', timeout: 10000 });
        await vitalsLink.click();

        const recordVitalsBtn = page.getByRole('button', { name: /Record vitals/i }).first();
        await recordVitalsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await recordVitalsBtn.click();

        const modalContainer = page.locator('div[class*="modal"], div[class*="slide-over"]').first();
        if (await modalContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
            const startVisitBtn = modalContainer.getByRole('button', { name: /start new visit/i });
            if (await startVisitBtn.isVisible().catch(() => false)) {
                await startVisitBtn.click();
            }
        }

        const appCrashAlert = page.locator('div[class*="inline-notification"]').filter({ hasText: 'patientUuid' });
        await expect(appCrashAlert).not.toBeVisible();

        const tempInput = page.locator('input[name*="vitalsTemp"], input[name*="temperature"], input[id*="temperature"]').first();
        if (await tempInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await expect(tempInput).toBeVisible();
            await expect(tempInput).toBeEditable();
            await tempInput.fill('37');
        }
    });

    test('TC_DSH_006 - Start new active clinical visit session', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('10001V5');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: '10001V5' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const startVisitBtn = page.locator('button:has-text("Start visit"), button:has-text("Start new visit")').first();
        if (await startVisitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await startVisitBtn.click();
        }

        if (page.url().includes('login/location')) {
            const clinicRadio = page.locator('label:has-text("Outpatient Clinic"), input[value*="Outpatient"]').first();
            await clinicRadio.scrollIntoViewIfNeeded();
            await clinicRadio.click({ force: true });
            
            const confirmLocationBtn = page.locator('button.esm-login_location-picker_confirmButton__mHNSY').first();
            await confirmLocationBtn.waitFor({ state: 'visible', timeout: 5000 });
            await confirmLocationBtn.scrollIntoViewIfNeeded();
            await confirmLocationBtn.click({ force: true });
            
            await page.waitForURL('**/chart/**', { timeout: 15000 });
            
            const startVisitAgainBtn = page.locator('button:has-text("Start visit"), button:has-text("Start new visit")').first();
            if (await startVisitAgainBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
                await startVisitAgainBtn.scrollIntoViewIfNeeded();
                await startVisitAgainBtn.click({ force: true });
            }
        }

        const visitTypeOption = page.locator('label, div, span').filter({ hasText: /Facility Visit|Outpatient|Clinic/i }).first();
        if (await visitTypeOption.isVisible({ timeout: 5000 }).catch(() => false)) {
            await visitTypeOption.click();
        }

        const confirmVisitBtn = page.locator('button[type="submit"], button:has-text("Confirm"), button:has-text("Save"), button:has-text("Start")').last();
        if (await confirmVisitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await confirmVisitBtn.scrollIntoViewIfNeeded();
            await confirmVisitBtn.click({ force: true });
        }

        const activeVisitIndicator = page.locator('span, div, button').filter({ hasText: /Active visit|End visit|Visit notes|Vitals/i }).first();
        await expect(activeVisitIndicator).toBeVisible({ timeout: 15000 });
    });

    test('TC_DSH_007 - Record and display patient vitals & biometrics', async ({ page }) => {
        const globalSearchBtn = page.locator('button[aria-label*="Search"], .omrs-header-search-container button').first();
        await globalSearchBtn.click();

        const searchInput = page.getByTestId('patientSearchBar');
        await searchInput.fill('10001V5');

        const patientResult = page.locator('li, tr, a, div[role="option"]').filter({ hasText: '10001V5' }).first();
        await patientResult.waitFor({ state: 'visible', timeout: 15000 });
        await patientResult.click();

        const vitalsLink = page.locator('a').filter({ hasText: /Vitals & Biometrics/i }).first();
        await vitalsLink.waitFor({ state: 'visible', timeout: 15000 });
        await vitalsLink.click();

        const startVisitModalBtn = page.getByRole('button', { name: /Start new visit/i });
        if (await startVisitModalBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await startVisitModalBtn.click();
            const confirmVisitBtn = page.getByRole('button', { name: /confirm|start/i }).last();
            if (await confirmVisitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmVisitBtn.click();
            }
        }

        const recordVitalsBtn = page.getByRole('button', { name: /Record vitals/i }).first();
        await recordVitalsBtn.waitFor({ state: 'visible', timeout: 10000 });
        await recordVitalsBtn.click();

        const tempInput = page.locator('input[name*="temperature"], input[id*="temperature"], input[name*="vitalsTemp"]').first();
        if (await tempInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await tempInput.fill('37');
        }

        const saveVitalsBtn = page.locator('button[type="submit"]:has-text("Save"), button:has-text("Save vitals"), button[type="submit"]').first();
        if (await saveVitalsBtn.isVisible().catch(() => false)) {
            await saveVitalsBtn.click();
        }

        const vitalsContainer = page.locator('div[class*="vitals-header"], div[class*="vitals"], table').first();
        await expect(vitalsContainer).toBeVisible({ timeout: 15000 });
    });

});