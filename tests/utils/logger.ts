import { Page } from "@playwright/test";

/**
 * Enhanced logging system for Playwright tests
 * Provides comprehensive logging, error tracking, and debugging capabilities
 */
export class TestLogger {
  private static logLevel: "debug" | "info" | "warn" | "error" = "info";
  private static logs: Array<{
    timestamp: string;
    level: string;
    message: string;
    context?: any;
    testName?: string;
  }> = [];

  /**
   * Set logging level
   * @param level - Logging level
   */
  static setLogLevel(level: "debug" | "info" | "warn" | "error"): void {
    this.logLevel = level;
  }

  /**
   * Log debug message
   * @param message - Debug message
   * @param context - Additional context
   * @param testName - Test name
   */
  static debug(message: string, context?: any, testName?: string): void {
    if (this.shouldLog("debug")) {
      this.log("debug", message, context, testName);
    }
  }

  /**
   * Log info message
   * @param message - Info message
   * @param context - Additional context
   * @param testName - Test name
   */
  static info(message: string, context?: any, testName?: string): void {
    if (this.shouldLog("info")) {
      this.log("info", message, context, testName);
    }
  }

  /**
   * Log warning message
   * @param message - Warning message
   * @param context - Additional context
   * @param testName - Test name
   */
  static warn(message: string, context?: any, testName?: string): void {
    if (this.shouldLog("warn")) {
      this.log("warn", message, context, testName);
    }
  }

  /**
   * Log error message
   * @param message - Error message
   * @param context - Additional context
   * @param testName - Test name
   */
  static error(message: string, context?: any, testName?: string): void {
    if (this.shouldLog("error")) {
      this.log("error", message, context, testName);
    }
  }

  /**
   * Log test step with enhanced formatting
   * @param step - Step description
   * @param testName - Test name
   * @param context - Additional context
   */
  static step(step: string, testName?: string, context?: any): void {
    const message = `🧪 ${step}`;
    this.info(message, context, testName);
  }

  /**
   * Log test assertion with enhanced formatting
   * @param assertion - Assertion description
   * @param testName - Test name
   * @param context - Additional context
   */
  static assertion(assertion: string, testName?: string, context?: any): void {
    const message = `✅ ${assertion}`;
    this.info(message, context, testName);
  }

  /**
   * Log test failure with enhanced formatting
   * @param failure - Failure description
   * @param testName - Test name
   * @param context - Additional context
   */
  static failure(failure: string, testName?: string, context?: any): void {
    const message = `❌ ${failure}`;
    this.error(message, context, testName);
  }

  /**
   * Log performance metrics
   * @param metrics - Performance metrics
   * @param testName - Test name
   */
  static performance(
    metrics: {
      duration: number;
      step: string;
      timestamp: number;
    },
    testName?: string
  ): void {
    const message = `⏱️ Performance: ${metrics.step} took ${metrics.duration}ms`;
    this.info(message, metrics, testName);
  }

  /**
   * Log network activity
   * @param activity - Network activity
   * @param testName - Test name
   */
  static network(
    activity: {
      url: string;
      method: string;
      status: number;
      duration: number;
    },
    testName?: string
  ): void {
    const message = `🌐 Network: ${activity.method} ${activity.url} - ${activity.status} (${activity.duration}ms)`;
    this.debug(message, activity, testName);
  }

  /**
   * Log page state
   * @param page - Playwright page object
   * @param testName - Test name
   */
  static async pageState(page: Page, testName?: string): Promise<void> {
    try {
      const url = page.url();
      const title = await page.title();
      const viewport = page.viewportSize();

      this.info(
        `📄 Page State: ${title}`,
        {
          url,
          title,
          viewport
        },
        testName
      );
    } catch (error) {
      this.warn("Failed to get page state", { error }, testName);
    }
  }

  /**
   * Log browser console messages
   * @param page - Playwright page object
   * @param testName - Test name
   */
  static async consoleMessages(page: Page, testName?: string): Promise<void> {
    try {
      const messages = await page.evaluate(() => {
        return (window as any).consoleMessages || [];
      });

      if (messages.length > 0) {
        this.debug(
          `🖥️ Console Messages: ${messages.length} messages`,
          messages,
          testName
        );
      }
    } catch (error) {
      this.warn("Failed to get console messages", { error }, testName);
    }
  }

  /**
   * Get all logs
   * @returns Array of log entries
   */
  static getLogs(): Array<{
    timestamp: string;
    level: string;
    message: string;
    context?: any;
    testName?: string;
  }> {
    return [...this.logs];
  }

  /**
   * Get logs by level
   * @param level - Log level
   * @returns Array of log entries
   */
  static getLogsByLevel(level: string): Array<{
    timestamp: string;
    level: string;
    message: string;
    context?: any;
    testName?: string;
  }> {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Get logs by test name
   * @param testName - Test name
   * @returns Array of log entries
   */
  static getLogsByTest(testName: string): Array<{
    timestamp: string;
    level: string;
    message: string;
    context?: any;
    testName?: string;
  }> {
    return this.logs.filter((log) => log.testName === testName);
  }

  /**
   * Clear all logs
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs to file
   * @param filename - Output filename
   */
  static async exportLogs(filename: string): Promise<void> {
    try {
      const fs = require("fs");
      const path = require("path");

      const dir = path.dirname(filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const logData = {
        timestamp: new Date().toISOString(),
        logs: this.logs,
        summary: {
          total: this.logs.length,
          byLevel: this.getLogSummaryByLevel(),
          byTest: this.getLogSummaryByTest()
        }
      };

      fs.writeFileSync(filename, JSON.stringify(logData, null, 2));
      this.info(`📁 Logs exported to: ${filename}`);
    } catch (error) {
      this.error("Failed to export logs", { error });
    }
  }

  /**
   * Get log summary by level
   * @returns Log summary by level
   */
  private static getLogSummaryByLevel(): Record<string, number> {
    const summary: Record<string, number> = {};
    this.logs.forEach((log) => {
      summary[log.level] = (summary[log.level] || 0) + 1;
    });
    return summary;
  }

  /**
   * Get log summary by test
   * @returns Log summary by test
   */
  private static getLogSummaryByTest(): Record<string, number> {
    const summary: Record<string, number> = {};
    this.logs.forEach((log) => {
      if (log.testName) {
        summary[log.testName] = (summary[log.testName] || 0) + 1;
      }
    });
    return summary;
  }

  /**
   * Check if should log at given level
   * @param level - Log level
   * @returns True if should log
   */
  private static shouldLog(level: string): boolean {
    const levels = ["debug", "info", "warn", "error"];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    return requestedLevelIndex >= currentLevelIndex;
  }

  /**
   * Internal log method
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context
   * @param testName - Test name
   */
  private static log(
    level: string,
    message: string,
    context?: any,
    testName?: string
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      testName
    };

    this.logs.push(logEntry);

    // Console output with formatting
    const emoji = this.getEmojiForLevel(level);
    const formattedMessage = `${emoji} [${timestamp}] ${message}`;

    switch (level) {
      case "debug":
        console.debug(formattedMessage, context || "");
        break;
      case "info":
        console.info(formattedMessage, context || "");
        break;
      case "warn":
        console.warn(formattedMessage, context || "");
        break;
      case "error":
        console.error(formattedMessage, context || "");
        break;
    }
  }

  /**
   * Get emoji for log level
   * @param level - Log level
   * @returns Emoji for level
   */
  private static getEmojiForLevel(level: string): string {
    const emojis: Record<string, string> = {
      debug: "🐛",
      info: "ℹ️",
      warn: "⚠️",
      error: "❌"
    };
    return emojis[level] || "📝";
  }
}

/**
 * Test context manager for better logging
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
    TestLogger.info(`🚀 Starting test: ${testName}`, {}, testName);
  }

  /**
   * Add step to test context
   * @param step - Step description
   */
  addStep(step: string): void {
    const timestamp = Date.now();
    this.steps.push({ step, timestamp });
    TestLogger.step(step, this.testName);
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
      TestLogger.performance({ duration, step, timestamp: Date.now() }, this.testName);
    }
  }

  /**
   * Get test duration
   * @returns Test duration in milliseconds
   */
  getDuration(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get test steps
   * @returns Array of test steps
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
   * @returns Test name
   */
  getTestName(): string {
    return this.testName;
  }

  /**
   * Complete test and log summary
   */
  completeTest(): void {
    const duration = this.getDuration();
    TestLogger.info(
      `🏁 Test completed: ${this.testName} (${duration}ms)`,
      {
        duration,
        steps: this.steps.length
      },
      this.testName
    );
  }
}
