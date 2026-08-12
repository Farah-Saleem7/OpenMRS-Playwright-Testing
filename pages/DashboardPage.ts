import { Page, Locator } from '@playwright/test';

export class DashboardPage {
    readonly page: Page;
    readonly addDiagnosisBtn: Locator;
    readonly addAllergyBtn: Locator;
    readonly endVisitBtn: Locator;
    readonly allergyBanner: Locator;

    constructor(page: Page) {
        this.page = page;
        this.addDiagnosisBtn = page.locator('button:has-text("Diagnoses")');
        this.addAllergyBtn = page.locator('button:has-text("Add Allergy")');
        this.endVisitBtn = page.locator('button:has-text("End Visit")');
        this.allergyBanner = page.locator('.allergy-alert-banner');
    }

    async navigateToPatient(patientId: string) {
        await this.page.goto(`https://dev3.openmrs.org/openmrs/spa/patient/${patientId}`);
    }
}