import { Page, Locator } from '@playwright/test';

export class OrdersPage {
    readonly page: Page;
    readonly newOrderBtn: Locator;
    readonly drugInput: Locator;
    readonly signOrderBtn: Locator;
    readonly capacityWarning: Locator;

    constructor(page: Page) {
        this.page = page;
        this.newOrderBtn = page.locator('button:has-text("Prescription Order Entry")');
        this.drugInput = page.locator('input[name="drugName"]');
        this.signOrderBtn = page.locator('button:has-text("Sign Order")');
        this.capacityWarning = page.locator('.scheduling-warning');
    }
}