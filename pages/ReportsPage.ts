import { Page, Locator } from '@playwright/test';

export class ReportsPage {
    readonly page: Page;
    readonly reportDropdown: Locator;
    readonly runReportBtn: Locator;
    readonly exportCsvBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.reportDropdown = page.locator('select[name="reportType"]');
        this.runReportBtn = page.locator('button:has-text("Run Report")');
        this.exportCsvBtn = page.locator('button:has-text("Export as CSV")');
    }

    async navigateToReports() {
        await this.page.goto('https://dev3.openmrs.org/openmrs/spa/reports');
    }
}