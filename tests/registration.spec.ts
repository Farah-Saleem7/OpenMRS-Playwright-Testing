import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegistrationPage } from '../pages/RegistrationPage';

test.describe('Registration & Merging Tests', () => {
    let loginPage: LoginPage;
    let regPage: RegistrationPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        regPage = new RegistrationPage(page);

        await page.goto('https://dev3.openmrs.org/openmrs/spa/login');
        await loginPage.login('admin', 'Admin123');

        if (page.url().includes('/login/location') || (await page.getByText('Select your location').isVisible().catch(() => false))) {
            await page.getByText('Inpatient Ward', { exact: false }).click();
            await page.getByRole('button', { name: 'Confirm' }).click();
            await page.waitForURL((url) => !url.href.includes('/login/location'), { timeout: 10000 });
        }
    });

    test('TC_REG_001 - Block alphanumeric in telephone field', async ({ page }) => {
        await page.goto('https://dev3.openmrs.org/openmrs/spa/patient-registration');
        
        const givenNameInput = page.locator('input[id="givenName"]');
        await givenNameInput.waitFor({ state: 'visible', timeout: 15000 });

        await givenNameInput.fill('Test');
        await page.locator('input[id="familyName"]').fill('Patient');
        await page.locator('label[for="gender-option-male"]').click();

        const dayInput = page.getByRole('spinbutton', { name: 'day, Date of birth' });
        const monthInput = page.getByRole('spinbutton', { name: 'month, Date of birth' });
        const yearInput = page.getByRole('spinbutton', { name: 'year, Date of birth' });

        await dayInput.waitFor({ state: 'visible' });
        await dayInput.fill('15');
        await monthInput.fill('10');
        await yearInput.fill('2000');

        const phoneInput = page.locator('input[id="phone"]');
        await phoneInput.scrollIntoViewIfNeeded();
        await phoneInput.fill('+1-800-CALL-NOW!@#');

        const addRelationshipBtn = page.locator('button:has-text("Add Relationship")');
        await addRelationshipBtn.scrollIntoViewIfNeeded();
        await addRelationshipBtn.click();

        const relatedPersonInput = page.locator('input[id="relationships[0].relatedPersonUuid"]');
        await relatedPersonInput.click();
        await relatedPersonInput.pressSequentially('James', { delay: 100 });

        const suggestionOption = page.locator('ul[class*="suggestions"] li').first();
        await suggestionOption.waitFor({ state: 'visible', timeout: 10000 });
        await suggestionOption.click();

        await page.locator('select[name="relationships[0].relationshipType"]').selectOption({ index: 1 });

        await page.locator('button:has-text("Register patient")').click();

        test.fail(true, 'DEFECT: Phone input field accepts invalid alphanumeric text and generates patient record.');

        await expect(page).not.toHaveURL(/.*\/chart.*/);
    });

    test('TC_REG_002 - Birthdate exceeding max age threshold', async ({ page }) => {
        await page.goto('https://dev3.openmrs.org/openmrs/spa/patient-registration');
        
        const givenNameInput = page.locator('input[id="givenName"]');
        await givenNameInput.waitFor({ state: 'visible', timeout: 15000 });

        await givenNameInput.fill('Test');
        await page.locator('input[id="familyName"]').fill('Patient');
        await page.locator('label[for="gender-option-male"]').click();

        const dayInput = page.getByRole('spinbutton', { name: 'day, Date of birth' });
        const monthInput = page.getByRole('spinbutton', { name: 'month, Date of birth' });
        const yearInput = page.getByRole('spinbutton', { name: 'year, Date of birth' });

        await dayInput.waitFor({ state: 'visible' });
        await dayInput.fill('01');
        await monthInput.fill('01');
        await yearInput.fill('1850');

        await page.keyboard.press('Tab');

        const ageWarning = page.getByText('Birthday cannot be more than 140 years ago');
        await expect(ageWarning).toBeVisible({ timeout: 7000 });

        await page.locator('button:has-text("Register patient")').click();

        try {
            await page.waitForURL(/.*\/chart.*/, { timeout: 4000 });
            throw new Error('APPLICATION BUG DETECTED: The application bypassed the maximum age constraint warning and registered the record.');
        } catch (error) {
            if (error instanceof Error && error.message.includes('APPLICATION BUG DETECTED')) {
                throw error;
            }
        }

        await expect(ageWarning).toBeVisible();
        await expect(page).toHaveURL(/.*\/patient-registration.*/);
    });

    test('TC_REG_003 - Resolve duplicate flag via manual record merge', async ({ page }) => {
        await page.goto('https://dev3.openmrs.org/openmrs/login.htm');
        if (await page.locator('input[name="uname"]').isVisible()) {
            await page.locator('input[name="uname"]').fill('admin');
            await page.locator('input[name="pw"]').fill('Admin123');
            await page.locator('input[type="submit"]').click();
        }

        await page.goto('https://dev3.openmrs.org/openmrs/admin/patients/mergePatients.form?patientId=27');

        const searchInput = page.locator('input#pSearch');
        await searchInput.waitFor({ state: 'visible' });
        await searchInput.fill('100');
        await searchInput.press('Enter');

        const patientLink = page.locator('td.patientIdentifier a').first();
        await patientLink.waitFor({ state: 'visible', timeout: 10000 });

        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
            patientLink.click()
        ]);

        await page.evaluate(() => {
            const prefInput = document.querySelector('input#pref') as HTMLInputElement;
            const nonPrefInput = document.querySelector('input#nonPref') as HTMLInputElement;
            const form = document.querySelector('form') as HTMLFormElement;

            if (prefInput && nonPrefInput) {
                prefInput.value = '27';
                nonPrefInput.value = '7';
            }

            if (form) {
                form.submit();
            }
        });

        await page.waitForURL((url) => !url.href.includes('mergePatients.form'), { timeout: 15000 });

        await expect(page).not.toHaveURL(/.*mergePatients\.form.*/);
        const successBanner = page.locator('#content');
        await expect(successBanner).toContainText('Patients merged successfully');
    });


 test('TC_REG_004 - Filter service queue by status "Any" and search "waiting"', async ({ page }) => {
    await page.goto('https://dev3.openmrs.org/openmrs/spa/home/service-queues');

    const statusDropdown = page.locator('#statusFilter button[role="combobox"]');
    await statusDropdown.waitFor({ state: 'visible' });
    await statusDropdown.click();

    const optionAny = page.locator('div[role="option"], li[role="option"]').filter({ hasText: 'Any' });
    await optionAny.click();

    const searchInput = page.locator('div[role="search"] input[type="text"], input[placeholder*="Search"]');
    await searchInput.waitFor({ state: 'visible' });
    await searchInput.fill('waiting');

    const tableRow = page.locator('tbody tr').first();
    await expect(tableRow).toBeVisible();
});

    test('TC_REG_005 - Prevent registration with blank mandatory demographic fields', async ({ page }) => {
    await page.goto('https://dev3.openmrs.org/openmrs/spa/patient-registration');

    const givenNameInput = page.locator('input[id="givenName"]');
    await givenNameInput.waitFor({ state: 'visible', timeout: 15000 });

    const registerBtn = page.locator('button:has-text("Register patient")');
    await registerBtn.click();

    await expect(page).toHaveURL(/.*\/patient-registration.*/);

    const errorSummaryBox = page.locator('text=The following fields have errors');
    await expect(errorSummaryBox).toBeVisible({ timeout: 10000 });

    const validationMessage = await givenNameInput.evaluate((node: HTMLInputElement) => node.validationMessage);
    expect(validationMessage).not.toBe('');
});
});