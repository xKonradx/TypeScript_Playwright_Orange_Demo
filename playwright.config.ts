import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for OrangeHRM test automation
 * Supports multiple browsers, environments, and test execution modes
 *
 * @see https://playwright.dev/docs/test-configuration
 */

// Environment configuration
const isCI = !!process.env.CI;
const baseURL = process.env.BASE_URL || "https://opensource-demo.orangehrmlive.com";
const headless = process.env.HEADLESS === "true" || isCI;

export default defineConfig({
  testDir: "./tests",

  // Test execution configuration
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 1 : undefined,

  // Test timeout configuration
  globalTimeout: 60 * 60 * 1000, // 1 hour for entire test suite

  // Timeout configuration
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000 // 10 seconds for assertions
  },

  // Reporter configuration
  reporter: isCI
    ? [
        ["html", { outputFolder: "playwright-report" }],
        ["json", { outputFile: "test-results/results.json" }],
        ["junit", { outputFile: "test-results/results.xml" }]
      ]
    : [
        ["html", { outputFolder: "playwright-report" }],
        ["json", { outputFile: "test-results/results.json" }]
      ],

  // Global test options
  use: {
    baseURL,
    headless,

    // Enhanced browser context options
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Network and performance settings
    actionTimeout: 15 * 1000, // 15 seconds for actions
    navigationTimeout: 30 * 1000, // 30 seconds for navigation

    // Trace and video for debugging
    trace: isCI ? "retain-on-failure" : "on-first-retry",
    video: isCI ? "retain-on-failure" : "off",
    screenshot: "only-on-failure",

    // Enhanced logging and debugging
    launchOptions: {
      slowMo: process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0,
      args: [
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ]
    },

    // Enhanced error handling
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9"
    }
  },

  // Browser and device projects
  projects: [
    // Desktop browsers
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Enhanced Chrome settings
        launchOptions: {
          args: ["--disable-web-security", "--disable-features=VizDisplayCompositor"]
        }
      }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    },

    // Mobile testing
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] }
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] }
    },

    // Branded browsers
    {
      name: "Microsoft Edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" }
    }
  ],

  // Global setup and teardown
  globalSetup: "./tests/global-setup.ts",
  globalTeardown: "./tests/global-teardown.ts"
});
