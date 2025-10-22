import { chromium, FullConfig } from "@playwright/test";
import { TestLogger } from "./utils/logger";
import { TestDataManager } from "./utils/test-data-manager";

/**
 * Enhanced global setup for Playwright tests
 * Performs comprehensive application health checks, environment validation, and test data preparation
 */
async function globalSetup(config: FullConfig) {
  TestLogger.info("🚀 Starting enhanced global test setup...");

  const baseURL = config.projects[0].use.baseURL;
  if (!baseURL) {
    throw new Error("Base URL not configured");
  }

  // Launch browser for health check
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  try {
    TestLogger.info(`🔍 Checking application health at ${baseURL}`);

    // Navigate to the application with enhanced error handling
    const response = await page.goto(baseURL, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    if (!response || !response.ok()) {
      throw new Error(`Application not accessible: ${response?.status()}`);
    }

    // Verify login page loads correctly with comprehensive checks
    const loginForm = page.getByRole("form");
    await loginForm.waitFor({ timeout: 10000 });

    // Check for required login elements
    const usernameField = page.getByRole("textbox", { name: /username/i });
    const passwordField = page.getByRole("textbox", { name: /password/i });
    const loginButton = page.getByRole("button", { name: /login/i });

    await Promise.all([
      usernameField.waitFor({ timeout: 5000 }),
      passwordField.waitFor({ timeout: 5000 }),
      loginButton.waitFor({ timeout: 5000 })
    ]);

    TestLogger.info("✅ Application health check passed");

    // Initialize test data
    TestLogger.info("📊 Initializing test data...");
    await initializeTestData();

    // Perform environment validation
    TestLogger.info("🔧 Validating test environment...");
    await validateTestEnvironment(config);
  } catch (error) {
    TestLogger.error("❌ Application health check failed", { error });
    throw error;
  } finally {
    await browser.close();
  }

  TestLogger.info("🎯 Enhanced global setup completed successfully");
}

/**
 * Initialize test data for the test suite
 */
async function initializeTestData(): Promise<void> {
  try {
    // Generate and store common test data
    const employeeData = TestDataManager.generateData("employee", {
      prefix: "Setup",
      includeTimestamp: true
    });
    TestDataManager.storeData("setup_employee", employeeData);

    const userData = TestDataManager.generateData("user", {
      prefix: "Setup",
      includeTimestamp: true
    });
    TestDataManager.storeData("setup_user", userData);

    const leaveData = TestDataManager.generateData("leave", {
      prefix: "Setup",
      includeTimestamp: true
    });
    TestDataManager.storeData("setup_leave", leaveData);

    TestLogger.info("✅ Test data initialized successfully");
  } catch (error) {
    TestLogger.error("❌ Failed to initialize test data", { error });
    throw error;
  }
}

/**
 * Validate test environment configuration
 */
async function validateTestEnvironment(config: FullConfig): Promise<void> {
  try {
    // Validate required environment variables
    const requiredEnvVars = ["BASE_URL"];
    const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}`
      );
    }

    // Validate configuration
    if (!config.projects || config.projects.length === 0) {
      throw new Error("No test projects configured");
    }

    // Validate timeout settings
    if (config.timeout && config.timeout < 10000) {
      TestLogger.warn(
        "Test timeout is less than 10 seconds, this may cause flaky tests"
      );
    }

    TestLogger.info("✅ Test environment validation passed");
  } catch (error) {
    TestLogger.error("❌ Test environment validation failed", { error });
    throw error;
  }
}

export default globalSetup;
