import { Page, Locator, expect } from "@playwright/test";

/**
 * Base page class providing common functionality and locator strategies
 * Implements best practices for Playwright test automation with enhanced error handling
 */
export class BasePage {
  readonly page: Page;

  protected readonly PATHS = {
    LOGIN: "/",
    DASHBOARD: "/web/index.php/dashboard/index",
    FORGOT_PASSWORD: "/web/index.php/auth/requestPasswordResetCode"
  } as const;

  protected readonly TIMEOUTS = {
    DEFAULT: 5000,
    NETWORK: 10000,
    NAVIGATION: 15000,
    ACTION: 10000,
    ASSERTION: 10000,
    LOAD: 30000
  } as const;

  protected readonly SELECTORS = {
    LOADING_INDICATOR: '[data-testid="loading"], .oxd-loading, .spinner',
    ERROR_MESSAGE: '.oxd-text--danger, .error, .alert-danger, [role="alert"]',
    SUCCESS_MESSAGE: '.oxd-text--success, .success, .alert-success, [role="status"]',
    MAIN_CONTENT: "main, .oxd-main, .content",
    HEADER: "header, .oxd-topbar, .navbar",
    FOOTER: "footer, .oxd-footer"
  } as const;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Get error message locator using multiple strategies with enhanced reliability
   * @returns Locator for error messages
   */
  getErrorMessage(): Locator {
    return this.page
      .getByRole("alert")
      .or(this.page.locator('[role="alert"]'))
      .or(this.page.locator(".oxd-text--danger"))
      .or(this.page.locator('.error, .alert-danger, [class*="error"]'))
      .or(this.page.locator(this.SELECTORS.ERROR_MESSAGE));
  }

  /**
   * Get success message locator using multiple strategies with enhanced reliability
   * @returns Locator for success messages
   */
  getSuccessMessage(): Locator {
    return this.page
      .getByRole("status")
      .or(this.page.locator('[role="status"]'))
      .or(this.page.locator(".oxd-text--success"))
      .or(this.page.locator('.success, .alert-success, [class*="success"]'))
      .or(this.page.locator(this.SELECTORS.SUCCESS_MESSAGE));
  }

  /**
   * Get text input locator using role-based and accessibility-first approach
   * @param identifier - Name, label, or placeholder text
   * @returns Locator for text input
   */
  getTextInput(identifier: string | RegExp): Locator {
    return this.page
      .getByRole("textbox", { name: identifier })
      .or(this.page.getByLabel(identifier))
      .or(this.page.getByPlaceholder(identifier))
      .or(this.page.locator('input[type="text"]').filter({ hasText: identifier }));
  }

  /**
   * Get password input locator using role-based approach
   * @param identifier - Name, label, or placeholder text
   * @returns Locator for password input
   */
  getPasswordInput(identifier: string | RegExp): Locator {
    return this.page
      .getByRole("textbox", { name: identifier })
      .or(this.page.getByLabel(identifier))
      .or(this.page.getByPlaceholder(identifier))
      .or(this.page.locator('input[type="password"]'));
  }

  /**
   * Get button locator using role-based approach
   * @param name - Button text or accessible name
   * @returns Locator for button
   */
  getButton(name: string | RegExp): Locator {
    return this.page.getByRole("button", { name });
  }

  /**
   * Get heading locator using role-based approach
   * @param name - Heading text or accessible name
   * @returns Locator for heading
   */
  getHeading(name: string | RegExp): Locator {
    return this.page.getByRole("heading", { name });
  }

  /**
   * Get link locator using role-based approach
   * @param name - Link text or accessible name
   * @returns Locator for link
   */
  getLink(name: string | RegExp): Locator {
    return this.page.getByRole("link", { name });
  }

  /**
   * Get menu item locator using role-based approach
   * @param name - Menu item text or accessible name
   * @returns Locator for menu item
   */
  getMenuItem(name: string | RegExp): Locator {
    return this.page.getByRole("menuitem", { name });
  }

  /**
   * Get text locator with exact or partial matching
   * @param text - Text content to find
   * @param exact - Whether to match exactly
   * @returns Locator for text
   */
  getText(text: string | RegExp, exact: boolean = false): Locator {
    return this.page.getByText(text, { exact });
  }

  /**
   * Get element by test ID (data-testid attribute)
   * @param testId - Test ID value
   * @returns Locator for element with test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get breadcrumb text locator
   * @param text - Breadcrumb text
   * @returns Locator for breadcrumb text
   */
  getBreadcrumbText(text: string): Locator {
    return this.page.locator(".oxd-topbar-header-breadcrumb-module").getByText(text);
  }

  /**
   * Get main menu item locator
   * @param text - Menu item text
   * @returns Locator for main menu item
   */
  getMainMenuItem(text: string): Locator {
    return this.page
      .locator(".oxd-main-menu-item--name")
      .getByText(text, { exact: true });
  }

  /**
   * Get error message locator for specific message
   * @param expectedMessage - Expected error message
   * @returns Locator for specific error message
   */
  getErrorMessageFor(expectedMessage: string | RegExp): Locator {
    return this.page.getByText(expectedMessage).or(this.getErrorMessage());
  }

  /**
   * Get success message locator for specific message
   * @param expectedMessage - Expected success message
   * @returns Locator for specific success message
   */
  getSuccessMessageFor(expectedMessage: string | RegExp): Locator {
    return this.page.getByText(expectedMessage).or(this.getSuccessMessage());
  }

  /**
   * Wait for network to be idle
   * @param timeout - Optional timeout override
   */
  async waitForNetworkIdle(timeout?: number): Promise<void> {
    await this.page.waitForLoadState("networkidle", {
      timeout: timeout || this.TIMEOUTS.NETWORK
    });
  }

  /**
   * Wait for URL to match pattern
   * @param pattern - URL pattern to match
   * @param timeout - Optional timeout override
   */
  async waitForUrl(pattern: string | RegExp, timeout?: number): Promise<void> {
    await this.page.waitForURL(pattern, {
      timeout: timeout || this.TIMEOUTS.NAVIGATION
    });
  }

  /**
   * Navigate to specific path
   * @param path - Path to navigate to
   * @param timeout - Optional timeout override
   */
  async navigateToPath(path: string, timeout?: number): Promise<void> {
    await this.page.goto(path, {
      waitUntil: "domcontentloaded",
      timeout: timeout || this.TIMEOUTS.NAVIGATION
    });
  }

  /**
   * Wait for element to be visible with enhanced error handling
   * @param locator - Locator to wait for
   * @param timeout - Optional timeout override
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: "visible",
      timeout: timeout || this.TIMEOUTS.DEFAULT
    });
  }

  /**
   * Wait for element to be hidden
   * @param locator - Locator to wait for
   * @param timeout - Optional timeout override
   */
  async waitForElementToBeHidden(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({
      state: "hidden",
      timeout: timeout || this.TIMEOUTS.DEFAULT
    });
  }

  /**
   * Enhanced click with error handling and logging
   * @param locator - Locator to click
   * @param timeout - Optional timeout override
   */
  async clickElement(locator: Locator, timeout?: number): Promise<void> {
    try {
      await locator.waitFor({
        state: "visible",
        timeout: timeout || this.TIMEOUTS.ACTION
      });
      await locator.click({ timeout: timeout || this.TIMEOUTS.ACTION });
    } catch (error) {
      console.error(`Failed to click element: ${error}`);
      throw error;
    }
  }

  /**
   * Enhanced fill with error handling and logging
   * @param locator - Locator to fill
   * @param value - Value to fill
   * @param timeout - Optional timeout override
   */
  async fillElement(locator: Locator, value: string, timeout?: number): Promise<void> {
    try {
      await locator.waitFor({
        state: "visible",
        timeout: timeout || this.TIMEOUTS.ACTION
      });
      await locator.clear();
      await locator.fill(value);
    } catch (error) {
      console.error(`Failed to fill element with value "${value}": ${error}`);
      throw error;
    }
  }

  /**
   * Enhanced assertion with better error messages
   * @param locator - Locator to assert
   * @param expectedText - Expected text content
   */
  async assertElementText(locator: Locator, expectedText: string): Promise<void> {
    await expect(locator).toHaveText(expectedText, {
      timeout: this.TIMEOUTS.ASSERTION
    });
  }

  /**
   * Assert element is visible
   * @param locator - Locator to assert
   */
  async assertElementVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible({ timeout: this.TIMEOUTS.ASSERTION });
  }

  /**
   * Assert element is hidden
   * @param locator - Locator to assert
   */
  async assertElementHidden(locator: Locator): Promise<void> {
    await expect(locator).toBeHidden({ timeout: this.TIMEOUTS.ASSERTION });
  }

  /**
   * Take screenshot with timestamp
   * @param name - Screenshot name
   */
  async takeScreenshot(name: string): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await this.page.screenshot({
      path: `test-results/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Get page title
   * @returns Page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   * @returns Current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Wait for loading indicators to disappear
   * @param timeout - Optional timeout override
   */
  async waitForLoadingToComplete(timeout?: number): Promise<void> {
    const loadingLocator = this.page.locator(this.SELECTORS.LOADING_INDICATOR);
    try {
      await loadingLocator.waitFor({
        state: "hidden",
        timeout: timeout || this.TIMEOUTS.DEFAULT
      });
    } catch (error) {
      // Loading indicator might not be present, which is fine
      console.debug("No loading indicator found or already completed");
    }
  }

  /**
   * Wait for page to be fully loaded with enhanced error handling
   * @param timeout - Optional timeout override
   */
  async waitForPageLoad(timeout?: number): Promise<void> {
    try {
      await Promise.all([
        this.page.waitForLoadState("domcontentloaded", {
          timeout: timeout || this.TIMEOUTS.LOAD
        }),
        this.page.waitForLoadState("networkidle", {
          timeout: timeout || this.TIMEOUTS.NETWORK
        })
      ]);
      await this.waitForLoadingToComplete();
    } catch (error) {
      console.error("Page load timeout:", error);
      throw new Error(`Page failed to load within ${timeout || this.TIMEOUTS.LOAD}ms`);
    }
  }

  /**
   * Enhanced click with retry mechanism and better error handling
   * @param locator - Locator to click
   * @param options - Click options
   */
  async clickWithRetry(
    locator: Locator,
    options: {
      timeout?: number;
      retries?: number;
      force?: boolean;
    } = {}
  ): Promise<void> {
    const { timeout = this.TIMEOUTS.ACTION, retries = 3, force = false } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await locator.waitFor({ state: "visible", timeout });
        await locator.click({ timeout, force });
        return;
      } catch (error) {
        console.warn(`Click attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          throw new Error(
            `Failed to click element after ${retries} attempts: ${error}`
          );
        }
        await this.page.waitForTimeout(1000); // Brief pause between retries
      }
    }
  }

  /**
   * Enhanced fill with retry mechanism and validation
   * @param locator - Locator to fill
   * @param value - Value to fill
   * @param options - Fill options
   */
  async fillWithRetry(
    locator: Locator,
    value: string,
    options: {
      timeout?: number;
      retries?: number;
      validate?: boolean;
    } = {}
  ): Promise<void> {
    const { timeout = this.TIMEOUTS.ACTION, retries = 3, validate = true } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await locator.waitFor({ state: "visible", timeout });
        await locator.clear();
        await locator.fill(value);

        if (validate) {
          const actualValue = await locator.inputValue();
          if (actualValue !== value) {
            throw new Error(
              `Value mismatch: expected "${value}", got "${actualValue}"`
            );
          }
        }
        return;
      } catch (error) {
        console.warn(`Fill attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          throw new Error(`Failed to fill element after ${retries} attempts: ${error}`);
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Wait for element with enhanced error handling and custom timeout
   * @param locator - Locator to wait for
   * @param options - Wait options
   */
  async waitForElementEnhanced(
    locator: Locator,
    options: {
      state?: "visible" | "hidden" | "attached" | "detached";
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<void> {
    const { state = "visible", timeout = this.TIMEOUTS.DEFAULT, retries = 1 } = options;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await locator.waitFor({ state, timeout });
        return;
      } catch (error) {
        console.warn(`Wait attempt ${attempt} failed:`, error);
        if (attempt === retries) {
          throw new Error(
            `Element not found in ${state} state after ${retries} attempts: ${error}`
          );
        }
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Take screenshot with enhanced error handling and automatic directory creation
   * @param name - Screenshot name
   * @param options - Screenshot options
   */
  async takeScreenshotEnhanced(
    name: string,
    options: {
      fullPage?: boolean;
      path?: string;
      createDir?: boolean;
    } = {}
  ): Promise<string> {
    const { fullPage = true, path, createDir = true } = options;
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const screenshotPath = path || `test-results/screenshots/${name}-${timestamp}.png`;

    try {
      if (createDir) {
        const fs = require("fs");
        const path = require("path");
        const dir = path.dirname(screenshotPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      }

      await this.page.screenshot({
        path: screenshotPath,
        fullPage
      });

      console.log(`Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
    } catch (error) {
      console.error(`Failed to take screenshot: ${error}`);
      throw error;
    }
  }

  /**
   * Get page performance metrics
   * @returns Performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    loadTime: number;
    domContentLoaded: number;
    networkIdle: number;
  }> {
    try {
      return await this.page.evaluate(() => {
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
    } catch (error) {
      console.warn("Failed to get performance metrics:", error);
      return { loadTime: 0, domContentLoaded: 0, networkIdle: 0 };
    }
  }

  /**
   * Check if element exists without throwing error
   * @param locator - Locator to check
   * @param timeout - Timeout in milliseconds
   * @returns True if element exists
   */
  async elementExists(locator: Locator, timeout: number = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view with smooth behavior
   * @param locator - Locator to scroll to
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get element text content with fallback
   * @param locator - Locator to get text from
   * @returns Text content or empty string
   */
  async getElementText(locator: Locator): Promise<string> {
    try {
      const text = await locator.textContent();
      return text?.trim() || "";
    } catch (error) {
      console.warn("Failed to get element text:", error);
      return "";
    }
  }

  /**
   * Wait for URL to change with pattern matching
   * @param pattern - URL pattern to match
   * @param timeout - Optional timeout override
   */
  async waitForUrlChange(pattern: string | RegExp, timeout?: number): Promise<void> {
    await this.page.waitForURL(pattern, {
      timeout: timeout || this.TIMEOUTS.NAVIGATION
    });
  }
}
