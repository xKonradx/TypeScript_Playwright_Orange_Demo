import { Page, expect, Locator } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { UserCredentials } from "../fixtures";
import { TestLogger, TestContext } from "./logger";
import { TestDataManager } from "./test-data-manager";

/**
 * Utility functions for common test operations
 * Provides reusable methods for login, navigation, assertions, and test data management
 */
export class TestUtils {
  /**
   * Perform complete login flow with enhanced logging and validation
   * @param loginPage - Login page object
   * @param dashboardPage - Dashboard page object
   * @param credentials - User credentials
   * @param options - Additional options for login
   */
  static async performCompleteLogin(
    loginPage: LoginPage,
    dashboardPage: DashboardPage,
    credentials: UserCredentials,
    options: {
      waitForDashboard?: boolean;
      takeScreenshot?: boolean;
      testName?: string;
      logSteps?: boolean;
    } = {}
  ): Promise<void> {
    const {
      waitForDashboard = true,
      takeScreenshot = false,
      testName = "login",
      logSteps = true
    } = options;

    const context = new TestContext(testName);

    try {
      if (logSteps) {
        context.addStep("Navigate to login page");
        TestLogger.info(
          "Starting login process",
          { username: credentials.username },
          testName
        );
      }

      // Navigate to login page
      await loginPage.goto();

      // Verify login page is loaded
      await loginPage.verifyLoginPageLoaded();

      if (logSteps) {
        context.completeStep("Navigate to login page");
        context.addStep("Perform login");
      }

      // Perform login with enhanced error handling
      await loginPage.login(credentials.username, credentials.password, {
        retries: 3,
        validate: true,
        takeScreenshot
      });

      if (waitForDashboard) {
        if (logSteps) {
          context.completeStep("Perform login");
          context.addStep("Wait for dashboard");
        }

        // Wait for successful login
        await loginPage.waitForLoginSuccess();

        // Verify dashboard is loaded
        await dashboardPage.verifyDashboardLoaded();

        if (logSteps) {
          context.completeStep("Wait for dashboard");
        }
      }

      if (takeScreenshot) {
        await this.takeScreenshot(loginPage.page, testName, "after-login");
      }

      if (logSteps) {
        TestLogger.info(
          "Login completed successfully",
          { username: credentials.username },
          testName
        );
        context.completeTest();
      }
    } catch (error) {
      TestLogger.error(
        `Login failed for user ${credentials.username}`,
        { error, username: credentials.username },
        testName
      );
      if (takeScreenshot) {
        await this.takeScreenshot(loginPage.page, testName, "login-failed");
      }
      if (logSteps) {
        context.completeTest();
      }
      throw error;
    }
  }

  /**
   * Navigate to module with comprehensive validation
   * @param dashboardPage - Dashboard page object
   * @param moduleName - Name of the module to navigate to
   * @param options - Additional options for navigation
   */
  static async navigateToModuleWithValidation(
    dashboardPage: DashboardPage,
    moduleName: string,
    options: {
      waitForLoad?: boolean;
      takeScreenshot?: boolean;
      testName?: string;
    } = {}
  ): Promise<void> {
    const {
      waitForLoad = true,
      takeScreenshot = false,
      testName = "navigation"
    } = options;

    try {
      // Navigate to module
      await dashboardPage.navigateToModule(moduleName);

      if (waitForLoad) {
        // Wait for module to load completely
        await dashboardPage.waitForModuleLoad(moduleName);
      }

      if (takeScreenshot) {
        await this.takeScreenshot(
          dashboardPage.page,
          testName,
          `navigated-to-${moduleName.toLowerCase()}`
        );
      }
    } catch (error) {
      console.error(`Navigation to ${moduleName} failed:`, error);
      if (takeScreenshot) {
        await this.takeScreenshot(
          dashboardPage.page,
          testName,
          `navigation-to-${moduleName.toLowerCase()}-failed`
        );
      }
      throw error;
    }
  }

  /**
   * Perform logout with validation
   * @param dashboardPage - Dashboard page object
   * @param loginPage - Login page object
   * @param options - Additional options for logout
   */
  static async performLogoutWithValidation(
    dashboardPage: DashboardPage,
    loginPage: LoginPage,
    options: {
      takeScreenshot?: boolean;
      testName?: string;
    } = {}
  ): Promise<void> {
    const { takeScreenshot = false, testName = "logout" } = options;

    try {
      // Perform logout
      await dashboardPage.logout();

      // Verify redirect to login page
      await expect(loginPage.page).toHaveURL(/login/);
      await loginPage.verifyLoginPageLoaded();

      if (takeScreenshot) {
        await this.takeScreenshot(loginPage.page, testName, "after-logout");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      if (takeScreenshot) {
        await this.takeScreenshot(dashboardPage.page, testName, "logout-failed");
      }
      throw error;
    }
  }

  /**
   * Take screenshot with descriptive naming
   * @param page - Playwright page object
   * @param testName - Name of the test
   * @param step - Step description
   * @param options - Screenshot options
   */
  static async takeScreenshot(
    page: Page,
    testName: string,
    step: string,
    options: {
      fullPage?: boolean;
      path?: string;
    } = {}
  ): Promise<void> {
    const { fullPage = true, path } = options;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath =
      path || `test-results/screenshots/${testName}-${step}-${timestamp}.png`;

    try {
      await page.screenshot({
        path: screenshotPath,
        fullPage
      });
      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`Failed to take screenshot: ${error}`);
    }
  }

  /**
   * Wait for network to be idle with timeout
   * @param page - Playwright page object
   * @param timeout - Timeout in milliseconds
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 10000): Promise<void> {
    try {
      await page.waitForLoadState("networkidle", { timeout });
    } catch (error) {
      console.warn(`Network idle timeout after ${timeout}ms:`, error);
    }
  }

  /**
   * Wait for element with enhanced error handling
   * @param locator - Locator to wait for
   * @param options - Wait options
   */
  static async waitForElement(
    locator: Locator,
    options: {
      state?: "visible" | "hidden" | "attached" | "detached";
      timeout?: number;
    } = {}
  ): Promise<void> {
    const { state = "visible", timeout = 10000 } = options;

    try {
      await locator.waitFor({ state, timeout });
    } catch (error) {
      console.error(`Element wait failed (${state}):`, error);
      throw error;
    }
  }

  /**
   * Enhanced assertion with better error messages
   * @param locator - Locator to assert
   * @param expectedText - Expected text content
   * @param timeout - Assertion timeout
   */
  static async assertElementText(
    locator: Locator,
    expectedText: string,
    timeout: number = 10000
  ): Promise<void> {
    try {
      await expect(locator).toHaveText(expectedText, { timeout });
    } catch (error) {
      const actualText = await locator.textContent();
      console.error(
        `Text assertion failed. Expected: "${expectedText}", Actual: "${actualText}"`
      );
      throw error;
    }
  }

  /**
   * Assert element is visible with enhanced error handling
   * @param locator - Locator to assert
   * @param timeout - Assertion timeout
   */
  static async assertElementVisible(
    locator: Locator,
    timeout: number = 10000
  ): Promise<void> {
    try {
      await expect(locator).toBeVisible({ timeout });
    } catch (error) {
      console.error("Element visibility assertion failed:", error);
      throw error;
    }
  }

  /**
   * Assert element is hidden with enhanced error handling
   * @param locator - Locator to assert
   * @param timeout - Assertion timeout
   */
  static async assertElementHidden(
    locator: Locator,
    timeout: number = 10000
  ): Promise<void> {
    try {
      await expect(locator).toBeHidden({ timeout });
    } catch (error) {
      console.error("Element hidden assertion failed:", error);
      throw error;
    }
  }

  /**
   * Assert URL contains expected pattern
   * @param page - Playwright page object
   * @param pattern - URL pattern to match
   * @param timeout - Assertion timeout
   */
  static async assertUrlContains(
    page: Page,
    pattern: string | RegExp,
    timeout: number = 10000
  ): Promise<void> {
    try {
      await expect(page).toHaveURL(pattern, { timeout });
    } catch (error) {
      const currentUrl = page.url();
      console.error(
        `URL assertion failed. Expected pattern: "${pattern}", Current URL: "${currentUrl}"`
      );
      throw error;
    }
  }

  /**
   * Generate random test data
   * @param type - Type of data to generate
   * @param options - Additional options for data generation
   */
  static generateTestData(
    type: "employee" | "leave" | "performance" | "user",
    options: {
      prefix?: string;
      includeTimestamp?: boolean;
    } = {}
  ): any {
    const { prefix = "Test", includeTimestamp = true } = options;
    const timestamp = includeTimestamp ? Date.now() : "";

    switch (type) {
      case "employee":
        return {
          firstName: `${prefix}${timestamp}`,
          lastName: `User${timestamp}`,
          employeeId: `EMP${timestamp}`,
          email: `test${timestamp}@example.com`
        };
      case "leave":
        return {
          leaveType: "Annual Leave",
          fromDate: "2024-01-01",
          toDate: "2024-01-05",
          comment: `${prefix} leave request ${timestamp}`
        };
      case "performance":
        return {
          employeeName: `${prefix} Employee ${timestamp}`,
          reviewPeriod: "2024",
          jobTitle: "Test Engineer"
        };
      case "user":
        return {
          username: `${prefix}User${timestamp}`,
          password: `TestPass${timestamp}!`
        };
      default:
        return {};
    }
  }

  /**
   * Clear browser storage and cookies
   * @param page - Playwright page object
   */
  static async clearBrowserData(page: Page): Promise<void> {
    try {
      await page.context().clearCookies();
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    } catch (error) {
      console.warn("Failed to clear browser data:", error);
    }
  }

  /**
   * Set viewport size for responsive testing
   * @param page - Playwright page object
   * @param size - Viewport size
   */
  static async setViewportSize(
    page: Page,
    size: "mobile" | "tablet" | "desktop" | "large"
  ): Promise<void> {
    const viewportSizes = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 720 },
      large: { width: 1920, height: 1080 }
    };

    await page.setViewportSize(viewportSizes[size]);
  }

  /**
   * Simulate slow network conditions
   * @param page - Playwright page object
   * @param delay - Delay in milliseconds
   */
  static async simulateSlowNetwork(page: Page, delay: number = 1000): Promise<void> {
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      await route.continue();
    });
  }

  /**
   * Get page performance metrics
   * @param page - Playwright page object
   */
  static async getPerformanceMetrics(page: Page): Promise<{
    loadTime: number;
    domContentLoaded: number;
    networkIdle: number;
  }> {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        networkIdle: navigation.loadEventEnd - navigation.fetchStart
      };
    });

    return metrics;
  }

  /**
   * Retry operation with exponential backoff
   * @param operation - Operation to retry
   * @param maxRetries - Maximum number of retries
   * @param baseDelay - Base delay in milliseconds
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Validate form field values
   * @param locator - Form field locator
   * @param expectedValue - Expected field value
   */
  static async validateFormField(
    locator: Locator,
    expectedValue: string
  ): Promise<void> {
    const actualValue = await locator.inputValue();
    expect(actualValue).toBe(expectedValue);
  }

  /**
   * Check if element exists without throwing error
   * @param locator - Locator to check
   * @param timeout - Timeout in milliseconds
   */
  static async elementExists(
    locator: Locator,
    timeout: number = 5000
  ): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate and store test data
   * @param type - Type of data to generate
   * @param options - Generation options
   * @returns Generated test data
   */
  static generateAndStoreTestData(
    type: "employee" | "user" | "leave" | "performance",
    options: {
      prefix?: string;
      includeTimestamp?: boolean;
      customFields?: Record<string, any>;
      storeKey?: string;
    } = {}
  ): any {
    const { storeKey = `test_${type}_${Date.now()}` } = options;
    const data = TestDataManager.generateData(type, options);
    TestDataManager.storeData(storeKey, data);
    TestLogger.info(`Generated and stored test data`, { type, storeKey }, "test-data");
    return data;
  }

  /**
   * Validate test data against schema
   * @param data - Data to validate
   * @param schema - Expected schema
   * @param testName - Test name for logging
   * @returns Validation result
   */
  static validateTestData(
    data: any,
    schema: Record<string, string>,
    testName?: string
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const result = TestDataManager.validateData(data, schema);

    if (result.isValid) {
      TestLogger.info("Test data validation passed", { data, schema }, testName);
    } else {
      TestLogger.error(
        "Test data validation failed",
        {
          data,
          schema,
          errors: result.errors,
          warnings: result.warnings
        },
        testName
      );
    }

    return result;
  }

  /**
   * Get stored test data
   * @param key - Data key
   * @param testName - Test name for logging
   * @returns Stored data
   */
  static getStoredTestData(key: string, testName?: string): any {
    const data = TestDataManager.getData(key);
    TestLogger.debug(`Retrieved stored test data`, { key, data }, testName);
    return data;
  }

  /**
   * Clear stored test data
   * @param key - Optional specific key to clear
   * @param testName - Test name for logging
   */
  static clearStoredTestData(key?: string, testName?: string): void {
    TestDataManager.clearData(key);
    TestLogger.info(`Cleared stored test data`, { key }, testName);
  }

  /**
   * Export test data to file
   * @param filename - Output filename
   * @param testName - Test name for logging
   */
  static async exportTestData(filename: string, testName?: string): Promise<void> {
    try {
      await TestDataManager.exportData(filename);
      TestLogger.info(`Exported test data to file`, { filename }, testName);
    } catch (error) {
      TestLogger.error("Failed to export test data", { error, filename }, testName);
      throw error;
    }
  }

  /**
   * Import test data from file
   * @param filename - Input filename
   * @param testName - Test name for logging
   */
  static async importTestData(filename: string, testName?: string): Promise<void> {
    try {
      await TestDataManager.importData(filename);
      TestLogger.info(`Imported test data from file`, { filename }, testName);
    } catch (error) {
      TestLogger.error("Failed to import test data", { error, filename }, testName);
      throw error;
    }
  }

  /**
   * Get test data summary
   * @param testName - Test name for logging
   * @returns Data summary
   */
  static getTestDataSummary(testName?: string): {
    totalEntries: number;
    entriesByType: Record<string, number>;
    memoryUsage: number;
  } {
    const summary = TestDataManager.getDataSummary();
    TestLogger.info("Test data summary", summary, testName);
    return summary;
  }

  /**
   * Generate random test data for specific scenario
   * @param scenario - Test scenario
   * @param options - Generation options
   * @returns Generated test data
   */
  static generateScenarioTestData(
    scenario:
      | "login"
      | "registration"
      | "employee_creation"
      | "leave_request"
      | "performance_review",
    options: {
      count?: number;
      customFields?: Record<string, any>;
    } = {}
  ): any {
    const data = TestDataManager.generateScenarioData(scenario, options);
    TestLogger.info(
      `Generated scenario test data`,
      { scenario, count: options.count },
      "test-data"
    );
    return data;
  }

  /**
   * Wait for element with comprehensive logging
   * @param locator - Locator to wait for
   * @param options - Wait options
   * @param testName - Test name for logging
   */
  static async waitForElementWithLogging(
    locator: Locator,
    options: {
      state?: "visible" | "hidden" | "attached" | "detached";
      timeout?: number;
      retries?: number;
    } = {},
    testName?: string
  ): Promise<void> {
    const { state = "visible", timeout = 10000, retries = 1 } = options;

    TestLogger.debug(`Waiting for element`, { state, timeout, retries }, testName);

    try {
      await locator.waitFor({ state, timeout });
      TestLogger.debug(`Element found`, { state }, testName);
    } catch (error) {
      TestLogger.error(`Element wait failed`, { error, state, timeout }, testName);
      throw error;
    }
  }

  /**
   * Perform action with retry and logging
   * @param action - Action to perform
   * @param options - Retry options
   * @param testName - Test name for logging
   */
  static async performActionWithRetry<T>(
    action: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
    } = {},
    testName?: string
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2
    } = options;

    TestLogger.debug(
      `Performing action with retry`,
      { maxRetries, baseDelay },
      testName
    );

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await action();
        TestLogger.debug(`Action succeeded`, { attempt }, testName);
        return result;
      } catch (error) {
        lastError = error as Error;
        TestLogger.warn(
          `Action attempt ${attempt} failed`,
          { error, attempt },
          testName
        );

        if (attempt < maxRetries) {
          const delay = Math.min(
            baseDelay * Math.pow(backoffMultiplier, attempt - 1),
            maxDelay
          );
          TestLogger.debug(`Retrying in ${delay}ms`, { attempt, delay }, testName);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    TestLogger.error(
      `Action failed after ${maxRetries} attempts`,
      { error: lastError },
      testName
    );
    throw lastError!;
  }
}
