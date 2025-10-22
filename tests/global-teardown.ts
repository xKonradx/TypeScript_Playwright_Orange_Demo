import { FullConfig } from "@playwright/test";
import { TestLogger } from "./utils/logger";
import { TestDataManager } from "./utils/test-data-manager";

/**
 * Enhanced global teardown for Playwright tests
 * Performs comprehensive cleanup operations, generates test summary, and exports results
 */
async function globalTeardown(config: FullConfig) {
  TestLogger.info("🧹 Starting enhanced global test teardown...");

  try {
    // Generate test summary
    TestLogger.info("📊 Generating test summary...");
    await generateTestSummary();

    // Export logs and test data
    TestLogger.info("📁 Exporting test artifacts...");
    await exportTestArtifacts();

    // Clean up test data
    TestLogger.info("🗑️ Cleaning up test data...");
    await cleanupTestData();

    // Generate performance report
    TestLogger.info("⚡ Generating performance report...");
    await generatePerformanceReport();

    TestLogger.info("✅ Enhanced global teardown completed successfully");
  } catch (error) {
    TestLogger.error("❌ Global teardown failed", { error });
    throw error;
  }
}

/**
 * Generate comprehensive test summary
 */
async function generateTestSummary(): Promise<void> {
  try {
    const logs = TestLogger.getLogs();
    const logSummary = {
      totalLogs: logs.length,
      byLevel: TestLogger.getLogsByLevel("error").length,
      byTest: TestLogger.getLogsByTest("login").length
    };

    TestLogger.info("📈 Test execution summary", logSummary);

    // Export logs to file
    await TestLogger.exportLogs("test-results/logs/test-execution-logs.json");
  } catch (error) {
    TestLogger.error("Failed to generate test summary", { error });
  }
}

/**
 * Export test artifacts (logs, data, screenshots)
 */
async function exportTestArtifacts(): Promise<void> {
  try {
    // Export test data
    await TestDataManager.exportData("test-results/data/test-data-export.json");

    // Export logs
    await TestLogger.exportLogs("test-results/logs/test-logs.json");

    TestLogger.info("✅ Test artifacts exported successfully");
  } catch (error) {
    TestLogger.error("Failed to export test artifacts", { error });
  }
}

/**
 * Clean up test data and temporary files
 */
async function cleanupTestData(): Promise<void> {
  try {
    // Clear test data
    TestDataManager.clearData();

    // Clear logs
    TestLogger.clearLogs();

    TestLogger.info("✅ Test data cleanup completed");
  } catch (error) {
    TestLogger.error("Failed to cleanup test data", { error });
  }
}

/**
 * Generate performance report
 */
async function generatePerformanceReport(): Promise<void> {
  try {
    const dataSummary = TestDataManager.getDataSummary();
    const logSummary = TestLogger.getLogs();

    const performanceReport = {
      timestamp: new Date().toISOString(),
      testData: dataSummary,
      logs: {
        total: logSummary.length,
        errors: logSummary.filter((log) => log.level === "error").length,
        warnings: logSummary.filter((log) => log.level === "warn").length
      },
      recommendations: generateRecommendations(logSummary)
    };

    // Write performance report
    const fs = require("fs");
    const path = require("path");

    const reportDir = "test-results/reports";
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(reportDir, "performance-report.json"),
      JSON.stringify(performanceReport, null, 2)
    );

    TestLogger.info("✅ Performance report generated");
  } catch (error) {
    TestLogger.error("Failed to generate performance report", { error });
  }
}

/**
 * Generate recommendations based on test execution
 */
function generateRecommendations(logs: any[]): string[] {
  const recommendations: string[] = [];

  const errorCount = logs.filter((log) => log.level === "error").length;
  const warningCount = logs.filter((log) => log.level === "warn").length;

  if (errorCount > 10) {
    recommendations.push(
      "Consider reviewing test stability - high error count detected"
    );
  }

  if (warningCount > 20) {
    recommendations.push(
      "Consider optimizing test data and assertions - high warning count detected"
    );
  }

  if (logs.length > 1000) {
    recommendations.push("Consider reducing log verbosity for better performance");
  }

  return recommendations;
}

export default globalTeardown;
