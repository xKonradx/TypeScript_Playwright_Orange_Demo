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

    test('TC_LOGIN_004: Invalid Password, "Invalid credentials" is displayed', {
        tag: ['@negative']
    }, async ({ loginPage, invalidPasswordUser }) => {
        await loginPage.goto();
        await loginPage.login(invalidPasswordUser.username, invalidPasswordUser.password);

        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('TC_LOGIN_005: Empty Username, "Required" validation message appears', {
        tag: ['@validation']
    }, async ({ loginPage, emptyUsernameUser }) => {
        await loginPage.goto();
        await loginPage.login(emptyUsernameUser.username, emptyUsernameUser.password);

        await expect(loginPage.singleRequiredMessage).toBeVisible({ timeout: 5000 });
    });

    test('TC_LOGIN_006: Empty Password, "Required" validation message appears', {
        tag: ['@validation']
    }, async ({ loginPage, emptyPasswordUser }) => {
        await loginPage.goto();
        await loginPage.login(emptyPasswordUser.username, emptyPasswordUser.password);

        await expect(loginPage.singleRequiredMessage).toBeVisible({ timeout: 5000 });
    });

    test('TC_LOGIN_007: Both Fields Empty, "Required" validation messages appear', {
        tag: ['@validation']
    }, async ({ loginPage, emptyBothUser }) => {
        await loginPage.goto();
        await loginPage.login(emptyBothUser.username, emptyBothUser.password);

        await expect(loginPage.usernameRequiredMessage).toBeVisible({ timeout: 5000 });
        await expect(loginPage.passwordRequiredMessage).toBeVisible({ timeout: 5000 });
    });

    test('TC_LOGIN_008: SQL Injection Test, login fails with "Invalid credentials"', {
        tag: ['@security']
    }, async ({ loginPage, sqlInjectionUser }) => {
        await loginPage.goto();
        await loginPage.login(sqlInjectionUser.username, sqlInjectionUser.password);

        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('TC_LOGIN_009: XSS Attack Test, script not executed and login fails', {
        tag: ['@security']
    }, async ({ loginPage, xssAttackUser }) => {
        await loginPage.goto();
        await loginPage.login(xssAttackUser.username, xssAttackUser.password);

        await expect(loginPage.errorMessage).toBeVisible({ timeout: 5000 });
    });
});