import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test('TC_LOGIN_001: Valid Login redirects to dashboard', {
    tag: ["@login", "@smoke"]
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
  tag: ["@login", "@negative"]
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