import { Page } from "@playwright/test";

/**
 * Error handling and logging utilities for Playwright tests
 * Provides comprehensive error management, logging, and debugging capabilities
 */
export class ErrorHandler {
  private static errorCount = 0;
  private static errorLog: Array<{
    timestamp: string;
    testName: string;
    error: string;
    stack?: string;
    screenshot?: string;
  }> = [];

  /**
   * Log error with context and optional screenshot
   * @param error - Error object
   * @param context - Additional context information
   * @param page - Playwright page object for screenshot
   */
  static async logError(
    error: Error,
    context: {
      testName: string;
      step?: string;
      additionalInfo?: string;
    },
    page?: Page
  ): Promise<void> {
    this.errorCount++;
    const timestamp = new Date().toISOString();

    const errorEntry = {
      timestamp,
      testName: context.testName,
      error: error.message,
      stack: error.stack,
      screenshot: undefined as string | undefined
    };

    // Take screenshot if page is provided
    if (page) {
      try {
        const screenshotPath = `test-results/errors/${context.testName}-${timestamp.replace(/[:.]/g, "-")}.png`;
        await page.screenshot({
          path: screenshotPath,
          fullPage: true
        });
        errorEntry.screenshot = screenshotPath;
      } catch (screenshotError) {
        console.warn("Failed to take error screenshot:", screenshotError);
      }
    }

    this.errorLog.push(errorEntry);

    // Log to console with formatting
    console.error(`
🚨 ERROR #${this.errorCount}
📅 Time: ${timestamp}
🧪 Test: ${context.testName}
📍 Step: ${context.step || "Unknown"}
❌ Error: ${error.message}
${context.additionalInfo ? `ℹ️  Info: ${context.additionalInfo}` : ""}
${errorEntry.screenshot ? `📸 Screenshot: ${errorEntry.screenshot}` : ""}
    `);
  }

  /**
   * Handle test failure with comprehensive logging
   * @param error - Error object
   * @param context - Test context
   * @param page - Playwright page object
   */
  static async handleTestFailure(
    error: Error,
    context: {
      testName: string;
      step?: string;
      testData?: any;
      pageUrl?: string;
    },
    page?: Page
  ): Promise<void> {
    await this.logError(error, context, page);

    // Additional failure handling
    if (page) {
      try {
        // Log page state
        const pageUrl = await page.url();
        const pageTitle = await page.title();

        console.error(`📄 Page URL: ${pageUrl}`);
        console.error(`📄 Page Title: ${pageTitle}`);

        // Log console errors from browser
        const consoleErrors = await page.evaluate(() => {
          return (window as any).consoleErrors || [];
        });

        if (consoleErrors.length > 0) {
          console.error(`🌐 Browser Console Errors:`, consoleErrors);
        }
      } catch (logError) {
        console.warn("Failed to log additional page information:", logError);
      }
    }
  }

  /**
   * Get error statistics
   */
  static getErrorStats(): {
    totalErrors: number;
    errorsByTest: Record<string, number>;
    recentErrors: Array<{
      timestamp: string;
      testName: string;
      error: string;
    }>;
  } {
    const errorsByTest: Record<string, number> = {};

    this.errorLog.forEach((entry) => {
      errorsByTest[entry.testName] = (errorsByTest[entry.testName] || 0) + 1;
    });

    return {
      totalErrors: this.errorCount,
      errorsByTest,
      recentErrors: this.errorLog.slice(-10).map((entry) => ({
        timestamp: entry.timestamp,
        testName: entry.testName,
        error: entry.error
      }))
    };
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorCount = 0;
    this.errorLog = [];
  }

  /**
   * Generate error report
   */
  static generateErrorReport(): string {
    const stats = this.getErrorStats();

    let report = `
# Error Report
Generated: ${new Date().toISOString()}

## Summary
- Total Errors: ${stats.totalErrors}
- Tests with Errors: ${Object.keys(stats.errorsByTest).length}

## Errors by Test
${Object.entries(stats.errorsByTest)
  .map(([test, count]) => `- ${test}: ${count} errors`)
  .join("\n")}

## Recent Errors
${stats.recentErrors
  .map((entry) => `- ${entry.timestamp} | ${entry.testName}: ${entry.error}`)
  .join("\n")}
`;

    return report;
  }
}

/**
 * Test context manager for better error tracking
 */
export class TestContext {
  private testName: string;
  private startTime: number;
  private steps: Array<{
    step: string;
    timestamp: number;
    duration?: number;
  }> = [];

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = Date.now();
  }

  /**
   * Add step to test context
   * @param step - Step description
   */
  addStep(step: string): void {
    const timestamp = Date.now();
    this.steps.push({ step, timestamp });
    console.log(`✅ ${this.testName} - ${step}`);
  }

  /**
   * Complete step and log duration
   * @param step - Step description
   */
  completeStep(step: string): void {
    const stepIndex = this.steps.findIndex((s) => s.step === step);
    if (stepIndex !== -1) {
      const duration = Date.now() - this.steps[stepIndex].timestamp;
      this.steps[stepIndex].duration = duration;
      console.log(`✅ ${this.testName} - ${step} completed in ${duration}ms`);
    }
  }

  /**
   * Get test duration
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get test steps
   */
  getSteps(): Array<{
    step: string;
    timestamp: number;
    duration?: number;
  }> {
    return [...this.steps];
  }

  /**
   * Get test name
   */
  getTestName(): string {
    return this.testName;
  }
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static metrics: Array<{
    testName: string;
    duration: number;
    timestamp: string;
    steps: number;
  }> = [];

  /**
   * Record test performance
   * @param testName - Name of the test
   * @param duration - Test duration in milliseconds
   * @param steps - Number of steps in the test
   */
  static recordTestPerformance(
    testName: string,
    duration: number,
    steps: number
  ): void {
    this.metrics.push({
      testName,
      duration,
      timestamp: new Date().toISOString(),
      steps
    });
  }

  /**
   * Get performance statistics
   */
  static getPerformanceStats(): {
    totalTests: number;
    averageDuration: number;
    slowestTest: string;
    fastestTest: string;
    averageSteps: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalTests: 0,
        averageDuration: 0,
        slowestTest: "",
        fastestTest: "",
        averageSteps: 0
      };
    }

    const durations = this.metrics.map((m) => m.duration);
    const steps = this.metrics.map((m) => m.steps);

    const slowest = this.metrics.reduce((prev, current) =>
      prev.duration > current.duration ? prev : current
    );

    const fastest = this.metrics.reduce((prev, current) =>
      prev.duration < current.duration ? prev : current
    );

    return {
      totalTests: this.metrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      slowestTest: `${slowest.testName} (${slowest.duration}ms)`,
      fastestTest: `${fastest.testName} (${fastest.duration}ms)`,
      averageSteps: steps.reduce((a, b) => a + b, 0) / steps.length
    };
  }

  /**
   * Clear performance metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
  }
}

/**
 * Test data validation utilities
 */
export class DataValidator {
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
   * Validate user credentials
   * @param credentials - User credentials to validate
   */
  static validateCredentials(credentials: { username: string; password: string }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!credentials.username || credentials.username.trim() === "") {
      errors.push("Username is required");
    }

    if (!credentials.password || credentials.password.trim() === "") {
      errors.push("Password is required");
    }

    if (credentials.username.length > 100) {
      errors.push("Username is too long (max 100 characters)");
    }

    if (credentials.password.length > 100) {
      errors.push("Password is too long (max 100 characters)");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
