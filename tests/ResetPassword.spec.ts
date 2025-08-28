import { test, expect } from './fixtures'

test.describe('Reset Password Functionality', {
    tag: ['@reset-password', '@critical']
}, () => {
    test('TC_RESET_PASSWORD_001: Valid username shows confirmation message', {
        tag: ['@smoke']
    }, async ({ loginPage, forgotPasswordPage, validUser }) => {
        await loginPage.goto();
        await loginPage.clickForgotPassword();
        await forgotPasswordPage.fillUsername(validUser.username);
        await forgotPasswordPage.clickResetPassword();
        
        await expect(forgotPasswordPage.successMessage).toBeVisible({ timeout: 10000 });
    });
});