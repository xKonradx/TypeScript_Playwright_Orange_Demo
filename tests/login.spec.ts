import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';

const TEST_USERS = {
    VALID: { username: 'Admin', password: 'admin123' },
    INVALID: { username: 'InvalidUser', password: 'admin123' }
} as const;

test.describe('Login Functionality', {
    tag: ['@login', '@critical']
}, () => {
    test('TC_LOGIN_001: Valid Login redirects to dashboard', {
        tag: ['@smoke']
    }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        const dashboardPage = new DashboardPage(page);
        
        await loginPage.goto();
        await loginPage.login(TEST_USERS.VALID.username, TEST_USERS.VALID.password);
        
        await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
        await expect(dashboardPage.dashboardHeading).toBeVisible();
    });

    test('TC_LOGIN_002: Invalid Username, "Invalid credentials" is displayed', {
        tag: ['@negative']
    }, async ({ page }) => {
        const loginPage = new LoginPage(page);

        await loginPage.goto();
        await loginPage.login(TEST_USERS.INVALID.username, TEST_USERS.INVALID.password);

        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('TC_LOGIN_003: Forgot Password Link', {
        tag: ['@navigation']
    }, async ({ page }) => {
        const loginPage = new LoginPage(page);
        const forgotPasswordPage = new ForgotPasswordPage(page);

        await loginPage.goto();
        await loginPage.clickForgotPassword();

        await expect(forgotPasswordPage.pageHeading).toBeVisible();
        await expect(forgotPasswordPage.instructionText).toBeVisible();
        await expect(forgotPasswordPage.usernameField).toBeVisible();
        await expect(forgotPasswordPage.cancelButton).toBeVisible();
        await expect(forgotPasswordPage.resetPasswordButton).toBeVisible();
    });
});