import { test, expect } from './fixtures'

test.describe('Login Functionality', {
    tag: ['@login', '@critical']
}, () => {
    test('TC_LOGIN_001: Valid Login redirects to dashboard', {
        tag: ['@smoke']
    }, async ({ loginPage, dashboardPage, validUser }) => {
        await loginPage.goto();
        await loginPage.login(validUser.username, validUser.password);
        
        await expect(loginPage.page).toHaveURL(/dashboard/, { timeout: 10000 });
        await expect(dashboardPage.dashboardHeading).toBeVisible();
    });

    test('TC_LOGIN_002: Invalid Username, "Invalid credentials" is displayed', {
        tag: ['@negative']
    }, async ({ loginPage, invalidUser }) => {
        await loginPage.goto();
        await loginPage.login(invalidUser.username, invalidUser.password);

        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('TC_LOGIN_003: Forgot Password Link', {
        tag: ['@navigation']
    }, async ({ loginPage, forgotPasswordPage }) => {
        await loginPage.goto();
        await loginPage.clickForgotPassword();

        await expect(forgotPasswordPage.pageHeading).toBeVisible();
        await expect(forgotPasswordPage.instructionText).toBeVisible();
        await expect(forgotPasswordPage.usernameField).toBeVisible();
        await expect(forgotPasswordPage.cancelButton).toBeVisible();
        await expect(forgotPasswordPage.resetPasswordButton).toBeVisible();
    });
});