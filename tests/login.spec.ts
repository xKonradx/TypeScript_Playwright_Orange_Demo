import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';

test('TC_LOGIN_001: Valid Login redirects to dashboard', {
    tag: ['@login', '@happypath']
}, async ({ page }) => {
    // Arrange - setup Page Object instances
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    
    // Act - perform login action
    await loginPage.goto();
    await loginPage.login('Admin', 'admin123');
    
    // Assert - verify complete dashboard load
    await dashboardPage.verifyFullDashboardLoad();
    
    // Additional assertion using Playwright's expect for extra confidence
    await expect(dashboardPage.dashboardHeading).toBeVisible();
});

test ('TC_LOGIN_002: Invalid Username, "Invalid credentials" is displayed', {
  tag: ['@login', '@negative']
}, async ({ page }) => {
    // Arrange - setup Page object instance
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    //Act - perform Login action with invalid credentials
    await loginPage.goto();
    await loginPage.login('InvalidUser', 'admin123');


    // Assert - verify "Invalid credentials" is displayed
    await loginPage.verifyInvalidCredentialsError()
  }
);

test ('TC_LOGIN_003: Forgot Password Link', {
  tag: ['@login', '@happypath']
}, async ({ page }) => {
    // Arrange - setup Page object instance
    const loginPage = new LoginPage(page);
    const forgotPasswordPage = new ForgotPasswordPage(page);

    //ACT - Navigate to login page and click on forgot password link
    await loginPage.goto();
    await loginPage.forgotPasswordLink.click();


    // Assert - verify that the Reset Password page is displayed

    await forgotPasswordPage.verifyPageIsDisplayed();
  }
);