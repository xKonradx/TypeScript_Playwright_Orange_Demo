import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Dashboard page
 * Handles all interactions and verifications related to the Dashboard
 */
export class DashboardPage {
    readonly page: Page;
    readonly dashboardHeading: Locator;

    /**
     * Creates new DashboardPage instance
     * param page - Playwright Page object representing browser tab
     */
    constructor(page: Page) {
        this.page = page;
        // Locate the main Dashboard heading element
        this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    }

    /**
     * Waits for Dashboard heading to become visible
     * Uses default Playwright timeout (30 seconds)
     * throws Error if element doesn't appear within timeout
     */
    async waitForDashboard(): Promise<void> {
        await this.dashboardHeading.waitFor({ state: 'visible' });
    }

    /**
     * Verifies that current URL contains 'dashboard'
     * Waits for URL change with default timeout
     * throws Error if URL doesn't match within timeout
     */
    async verifyDashboardUrl(): Promise<void> {
        await this.page.waitForURL(/dashboard/);
    }

    /**
     * Complete verification that Dashboard page loaded successfully
     * Combines URL verification and element visibility check
     * Recommended method for post-login verification
     * throws Error if either URL or element verification fails
     */
    async verifyFullDashboardLoad(): Promise<void> {
        await this.verifyDashboardUrl();  // First verify URL navigation
        await this.waitForDashboard();    // Then verify page content loaded
    }
}