import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Login page
 * Handles login functionality including successful and failed login scenarios
 */
export class LoginPage {
    readonly page: Page;
    readonly username: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;

    /**
     * Creates new LoginPage instance
     * param page - Playwright Page object representing browser tab
     */
    constructor(page: Page) {
        this.page = page;
        // Locate username input field by placeholder text
        this.username = page.getByPlaceholder('Username');
        // Locate password input field by placeholder text
        this.password = page.getByPlaceholder('Password');
        // Locate login button by role and name
        this.loginButton = page.getByRole('button', { name: 'Login' });
        // Locate error message for invalid credentials
        this.errorMessage = page.locator('text=/invalid.*credentials/i');
    }

    /**
     * Navigates to the login page
     * throws Error if navigation fails within timeout
     */
    async goto(): Promise<void> {
        await this.page.goto('https://opensource-demo.orangehrmlive.com/');
    }

    /**
     * Performs login action with provided credentials
     * Fills username, password and clicks login button
     * param user - Username to enter
     * param pass - Password to enter
     * throws Error if any of the form interactions fail
     */
    async login(user: string, pass: string): Promise<void> {
        await this.username.fill(user);
        await this.password.fill(pass);
        await this.loginButton.click();
    }

    /**
     * Verifies that invalid credentials error message is displayed
     * Waits for error message to become visible after failed login attempt
     * throws Error if error message doesn't appear within timeout
     */
    async verifyInvalidCredentialsError(): Promise<void> {
        await this.errorMessage.waitFor({ state: 'visible' });
    }
}