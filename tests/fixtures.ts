import { test as base, Page, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { ForgotPasswordPage } from "../pages/ForgotPasswordPage";
import { AdminPage } from "../pages/AdminPage";
import { PimPage } from "../pages/PimPage";
import { LeavePage } from "../pages/LeavePage";
import { TimePage } from "../pages/TimePage";
import { MyInfoPage } from "../pages/MyInfoPage";
import { RecruitmentPage } from "../pages/RecruitmentPage";
import { PerformancePage } from "../pages/PerformancePage";
import { DirectoryPage } from "../pages/DirectoryPage";
import { MaintenancePage } from "../pages/MaintenancePage";
import { ClaimPage } from "../pages/ClaimPage";
import { BuzzPage } from "../pages/BuzzPage";
import { BasePage } from "../pages/BasePage";

/**
 * User credentials interface for type safety
 */
export interface UserCredentials {
  username: string;
  password: string;
}

/**
 * Test user data with comprehensive test scenarios
 */
export const TEST_USERS = {
  VALID: { username: "Admin", password: "admin123" },
  INVALID: { username: "InvalidUser", password: "admin123" },
  INVALID_PASSWORD: { username: "Admin", password: "wrongpassword" },
  EMPTY_USERNAME: { username: "", password: "admin123" },
  EMPTY_PASSWORD: { username: "Admin", password: "" },
  EMPTY_BOTH: { username: "", password: "" },
  SQL_INJECTION: {
    username: "admin'-- ",
    password: "' UNION SELECT 1,user(),version()-- "
  },
  XSS_ATTACK: {
    username: '"><img src=x onerror=alert("XSS")>',
    password: "admin123"
  },
  SPECIAL_CHARS: {
    username: "Admin@#$%",
    password: "admin123!@#"
  },
  LONG_CREDENTIALS: {
    username: "A".repeat(100),
    password: "P".repeat(100)
  }
} as const;

/**
 * Test data for different modules and scenarios
 */
export const TEST_DATA = {
  EMPLOYEES: {
    VALID: {
      firstName: "John",
      lastName: "Doe",
      employeeId: "EMP001",
      email: "john.doe@example.com"
    },
    INVALID: {
      firstName: "",
      lastName: "",
      employeeId: "",
      email: "invalid-email"
    }
  },
  LEAVE: {
    VALID: {
      leaveType: "Annual Leave",
      fromDate: "2024-01-01",
      toDate: "2024-01-05",
      comment: "Annual vacation"
    }
  },
  PERFORMANCE: {
    VALID: {
      employeeName: "John Doe",
      reviewPeriod: "2024",
      jobTitle: "Software Engineer"
    }
  }
} as const;

/**
 * Page fixtures type definition
 */
type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  forgotPasswordPage: ForgotPasswordPage;
  adminPage: AdminPage;
  pimPage: PimPage;
  leavePage: LeavePage;
  timePage: TimePage;
  myInfoPage: MyInfoPage;
  recruitmentPage: RecruitmentPage;
  performancePage: PerformancePage;
  directoryPage: DirectoryPage;
  maintenancePage: MaintenancePage;
  claimPage: ClaimPage;
  buzzPage: BuzzPage;
};

/**
 * User fixtures type definition
 */
type UserFixtures = {
  users: typeof TEST_USERS;
  testData: typeof TEST_DATA;
};

/**
 * Combined test fixtures type
 */
type TestFixtures = PageFixtures & UserFixtures;

/**
 * Helper function to create page fixtures with enhanced error handling
 * @param PageClass - Page class constructor
 * @returns Fixture function
 */
function createPageFixture<T extends BasePage>(PageClass: new (page: Page) => T) {
  return async ({ page }: { page: Page }, use: (fixture: T) => Promise<void>) => {
    try {
      const pageInstance = new PageClass(page);
      await use(pageInstance);
    } catch (error) {
      console.error(`Error creating page fixture for ${PageClass.name}:`, error);
      throw error;
    }
  };
}

/**
 * Enhanced test fixture with comprehensive page objects and test data
 */
export const test = base.extend<TestFixtures>({
  // Page object fixtures
  loginPage: createPageFixture(LoginPage),
  dashboardPage: createPageFixture(DashboardPage),
  forgotPasswordPage: createPageFixture(ForgotPasswordPage),
  adminPage: createPageFixture(AdminPage),
  pimPage: createPageFixture(PimPage),
  leavePage: createPageFixture(LeavePage),
  timePage: createPageFixture(TimePage),
  myInfoPage: createPageFixture(MyInfoPage),
  recruitmentPage: createPageFixture(RecruitmentPage),
  performancePage: createPageFixture(PerformancePage),
  directoryPage: createPageFixture(DirectoryPage),
  maintenancePage: createPageFixture(MaintenancePage),
  claimPage: createPageFixture(ClaimPage),
  buzzPage: createPageFixture(BuzzPage),

  // Test data fixtures
  users: async ({}, use) => {
    await use(TEST_USERS);
  },

  testData: async ({}, use) => {
    await use(TEST_DATA);
  }
});

/**
 * Enhanced helper functions for common test operations with comprehensive error handling
 */
export class TestHelpers {
  /**
   * Perform login with specified credentials using enhanced methods
   * @param loginPage - Login page object
   * @param credentials - User credentials
   * @param options - Login options
   */
  static async performLogin(
    loginPage: LoginPage,
    credentials: UserCredentials,
    options: {
      retries?: number;
      takeScreenshot?: boolean;
      validateForm?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, takeScreenshot = false, validateForm = true } = options;

    try {
      // Navigate to login page
      await loginPage.goto();

      // Wait for form to be ready
      await loginPage.waitForFormReady();

      // Validate form if requested
      if (validateForm) {
        const validation = await loginPage.validateLoginForm(
          credentials.username,
          credentials.password
        );
        if (!validation.isValid) {
          throw new Error(`Form validation failed: ${validation.errors.join(", ")}`);
        }
      }

      // Perform login with enhanced error handling
      await loginPage.login(credentials.username, credentials.password, {
        retries,
        validate: true,
        takeScreenshot
      });
    } catch (error) {
      console.error(`Login failed for user ${credentials.username}:`, error);
      if (takeScreenshot) {
        await loginPage.takeScreenshotEnhanced("login-failed");
      }
      throw error;
    }
  }

  /**
   * Perform login and wait for dashboard with comprehensive validation
   * @param loginPage - Login page object
   * @param dashboardPage - Dashboard page object
   * @param credentials - User credentials
   * @param options - Login options
   */
  static async loginAndWaitForDashboard(
    loginPage: LoginPage,
    dashboardPage: DashboardPage,
    credentials: UserCredentials,
    options: {
      retries?: number;
      takeScreenshot?: boolean;
      validateForm?: boolean;
      waitForDashboard?: boolean;
    } = {}
  ): Promise<void> {
    const {
      retries = 3,
      takeScreenshot = false,
      validateForm = true,
      waitForDashboard = true
    } = options;

    try {
      // Perform login
      await this.performLogin(loginPage, credentials, {
        retries,
        takeScreenshot,
        validateForm
      });

      if (waitForDashboard) {
        // Wait for successful login
        await loginPage.waitForLoginSuccess();

        // Verify dashboard is loaded
        await dashboardPage.verifyDashboardLoaded();

        // Wait for dashboard to be fully ready
        await dashboardPage.waitForDashboard();
      }

      if (takeScreenshot) {
        await dashboardPage.takeScreenshotEnhanced("dashboard-loaded");
      }
    } catch (error) {
      console.error(
        `Login and dashboard navigation failed for user ${credentials.username}:`,
        error
      );
      if (takeScreenshot) {
        await loginPage.takeScreenshotEnhanced("login-dashboard-failed");
      }
      throw error;
    }
  }

  /**
   * Navigate to module and verify it loaded with enhanced error handling
   * @param dashboardPage - Dashboard page object
   * @param moduleName - Name of the module to navigate to
   * @param options - Navigation options
   */
  static async navigateToModule(
    dashboardPage: DashboardPage,
    moduleName: string,
    options: {
      retries?: number;
      takeScreenshot?: boolean;
      validateNavigation?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, takeScreenshot = false, validateNavigation = true } = options;

    try {
      await dashboardPage.navigateToModule(moduleName, {
        retries,
        takeScreenshot,
        validateNavigation
      });

      if (takeScreenshot) {
        await dashboardPage.takeScreenshotEnhanced(
          `module-navigation-${moduleName.toLowerCase()}`
        );
      }
    } catch (error) {
      console.error(`Navigation to module "${moduleName}" failed:`, error);
      if (takeScreenshot) {
        await dashboardPage.takeScreenshotEnhanced(
          `module-navigation-failed-${moduleName.toLowerCase()}`
        );
      }
      throw error;
    }
  }

  /**
   * Take screenshot with descriptive name
   * @param page - Playwright page object
   * @param testName - Name of the test
   * @param step - Step description
   */
  static async takeScreenshot(
    page: Page,
    testName: string,
    step: string
  ): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await page.screenshot({
      path: `test-results/screenshots/${testName}-${step}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Wait for network to be idle with timeout
   * @param page - Playwright page object
   * @param timeout - Timeout in milliseconds
   */
  static async waitForNetworkIdle(page: Page, timeout: number = 10000): Promise<void> {
    await page.waitForLoadState("networkidle", { timeout });
  }

  /**
   * Generate random test data with enhanced options
   * @param type - Type of data to generate
   * @param options - Data generation options
   * @returns Generated test data
   */
  static generateTestData(
    type: "employee" | "leave" | "performance" | "user",
    options: {
      prefix?: string;
      includeTimestamp?: boolean;
      customFields?: Record<string, any>;
    } = {}
  ): any {
    const { prefix = "Test", includeTimestamp = true, customFields = {} } = options;
    const timestamp = includeTimestamp ? Date.now() : "";

    const baseData = (() => {
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
    })();

    return { ...baseData, ...customFields };
  }

  /**
   * Perform logout with comprehensive validation
   * @param dashboardPage - Dashboard page object
   * @param loginPage - Login page object
   * @param options - Logout options
   */
  static async performLogout(
    dashboardPage: DashboardPage,
    loginPage: LoginPage,
    options: {
      takeScreenshot?: boolean;
      validateLogout?: boolean;
    } = {}
  ): Promise<void> {
    const { takeScreenshot = false, validateLogout = true } = options;

    try {
      // Perform logout
      await dashboardPage.logout();

      if (validateLogout) {
        // Verify redirect to login page
        await loginPage.waitForUrlChange(/login/);
        await loginPage.verifyLoginPageLoaded();
      }

      if (takeScreenshot) {
        await loginPage.takeScreenshotEnhanced("logout-successful");
      }
    } catch (error) {
      console.error("Logout failed:", error);
      if (takeScreenshot) {
        await dashboardPage.takeScreenshotEnhanced("logout-failed");
      }
      throw error;
    }
  }

  /**
   * Wait for page to be fully loaded with enhanced error handling
   * @param page - Playwright page object
   * @param options - Wait options
   */
  static async waitForPageLoad(
    page: any,
    options: {
      timeout?: number;
      waitForNetwork?: boolean;
      waitForLoading?: boolean;
    } = {}
  ): Promise<void> {
    const { timeout = 30000, waitForNetwork = true, waitForLoading = true } = options;

    try {
      const promises = [page.waitForLoadState("domcontentloaded", { timeout })];

      if (waitForNetwork) {
        promises.push(page.waitForLoadState("networkidle", { timeout }));
      }

      await Promise.all(promises);

      if (waitForLoading) {
        // Wait for loading indicators to disappear
        const loadingLocator = page.locator(
          '[data-testid="loading"], .oxd-loading, .spinner'
        );
        try {
          await loadingLocator.waitFor({ state: "hidden", timeout: 5000 });
        } catch {
          // Loading indicator might not be present, which is fine
        }
      }
    } catch (error) {
      console.error("Page load timeout:", error);
      throw new Error(`Page failed to load within ${timeout}ms`);
    }
  }

  /**
   * Retry operation with exponential backoff
   * @param operation - Operation to retry
   * @param options - Retry options
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffMultiplier?: number;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffMultiplier = 2
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          const delay = Math.min(
            baseDelay * Math.pow(backoffMultiplier, attempt - 1),
            maxDelay
          );
          console.log(`Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Validate test data structure
   * @param data - Data to validate
   * @param schema - Expected schema
   */
  static validateTestData(
    data: any,
    schema: Record<string, string>
  ): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in data)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      const actualType = typeof data[key];
      if (actualType !== expectedType) {
        errors.push(`Field ${key} expected type ${expectedType}, got ${actualType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear browser storage and cookies
   * @param page - Playwright page object
   */
  static async clearBrowserData(page: any): Promise<void> {
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
    page: any,
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
}

/**
 * Re-export expect for convenience
 */
export { expect };
