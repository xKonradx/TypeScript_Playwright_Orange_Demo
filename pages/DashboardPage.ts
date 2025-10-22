import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Dashboard page object implementing best practices for OrangeHRM dashboard functionality
 * Provides reliable navigation methods and enhanced user interactions
 */
export class DashboardPage extends BasePage {
  // Main dashboard elements
  readonly dashboardHeading: Locator;
  readonly dashboardContent: Locator;

  // User account elements
  readonly userDropdown: Locator;
  readonly userProfile: Locator;
  readonly logoutButton: Locator;

  // Navigation elements
  readonly mainMenu: Locator;
  readonly menuItems: Locator;

  // Dashboard widgets
  readonly quickLaunch: Locator;
  readonly employeeDistribution: Locator;
  readonly pendingRequests: Locator;

  constructor(page: Page) {
    super(page);

    // Main dashboard elements
    this.dashboardHeading = this.getHeading("Dashboard");
    this.dashboardContent = this.page.locator(".oxd-dashboard-grid");

    // User account elements
    this.userDropdown = this.page.locator(".oxd-userdropdown");
    this.userProfile = this.page.locator(".oxd-userdropdown-tab");
    this.logoutButton = this.getText("Logout");

    // Navigation elements
    this.mainMenu = this.page.locator(".oxd-main-menu");
    this.menuItems = this.page.locator(".oxd-main-menu-item");

    // Dashboard widgets
    this.quickLaunch = this.page.locator(".oxd-dashboard-widget");
    this.employeeDistribution = this.page.locator(".oxd-chart-container");
    this.pendingRequests = this.page.locator(".oxd-widget-header");
  }

  /**
   * Navigate to dashboard page
   */
  async goto(): Promise<void> {
    await this.navigateToPath(this.PATHS.DASHBOARD);
    await this.waitForDashboard();
  }

  /**
   * Wait for dashboard to load completely
   */
  async waitForDashboard(): Promise<void> {
    await this.waitForElement(this.dashboardHeading);
    await this.waitForElement(this.dashboardContent);
    await this.waitForNetworkIdle();
  }

  /**
   * Click on main menu item with enhanced error handling and retry mechanism
   * @param menuName - Name of the menu item to click
   * @param options - Click options
   */
  async clickMenu(
    menuName: string,
    options: {
      retries?: number;
      waitForNavigation?: boolean;
      takeScreenshot?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, waitForNavigation = true, takeScreenshot = false } = options;

    try {
      const menuLocator = this.getMainMenuItem(menuName);

      // Ensure menu item is visible and clickable
      await this.scrollIntoView(menuLocator);
      await this.waitForElementEnhanced(menuLocator, {
        state: "visible",
        timeout: this.TIMEOUTS.ACTION,
        retries: 2
      });

      // Click with retry mechanism
      await this.clickWithRetry(menuLocator, {
        timeout: this.TIMEOUTS.ACTION,
        retries
      });

      if (waitForNavigation) {
        // Wait for navigation to complete
        await this.waitForNetworkIdle();
        await this.waitForLoadingToComplete();
      }

      if (takeScreenshot) {
        await this.takeScreenshotEnhanced(`navigated-to-${menuName.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Failed to click menu item "${menuName}":`, error);
      if (takeScreenshot) {
        await this.takeScreenshotEnhanced(
          `menu-click-failed-${menuName.toLowerCase()}`
        );
      }
      throw error;
    }
  }

  /**
   * Navigate to Admin module
   */
  async clickAdminMenu(): Promise<void> {
    await this.clickMenu("Admin");
  }

  /**
   * Navigate to PIM module
   */
  async clickPimMenu(): Promise<void> {
    await this.clickMenu("PIM");
  }

  /**
   * Navigate to Leave module
   */
  async clickLeaveMenu(): Promise<void> {
    await this.clickMenu("Leave");
  }

  /**
   * Navigate to Time module
   */
  async clickTimeMenu(): Promise<void> {
    await this.clickMenu("Time");
  }

  /**
   * Navigate to Recruitment module
   */
  async clickRecruitmentMenu(): Promise<void> {
    await this.clickMenu("Recruitment");
  }

  /**
   * Navigate to My Info module
   */
  async clickMyInfoMenu(): Promise<void> {
    await this.clickMenu("My Info");
  }

  /**
   * Navigate to Performance module
   */
  async clickPerformanceMenu(): Promise<void> {
    await this.clickMenu("Performance");
  }

  /**
   * Navigate to Directory module
   */
  async clickDirectoryMenu(): Promise<void> {
    await this.clickMenu("Directory");
  }

  /**
   * Navigate to Maintenance module
   */
  async clickMaintenanceMenu(): Promise<void> {
    await this.clickMenu("Maintenance");
  }

  /**
   * Navigate to Claim module
   */
  async clickClaimMenu(): Promise<void> {
    await this.clickMenu("Claim");
  }

  /**
   * Navigate to Buzz module
   */
  async clickBuzzMenu(): Promise<void> {
    await this.clickMenu("Buzz");
  }

  /**
   * Navigate back to Dashboard
   */
  async clickDashboardMenu(): Promise<void> {
    await this.clickMenu("Dashboard");
  }

  /**
   * Perform user logout
   */
  async logout(): Promise<void> {
    await this.clickElement(this.userDropdown);
    await this.clickElement(this.logoutButton);

    // Wait for redirect to login page
    await this.waitForUrl(/login/);
  }

  /**
   * Verify dashboard is loaded correctly
   */
  async verifyDashboardLoaded(): Promise<void> {
    await this.assertElementVisible(this.dashboardHeading);
    await this.assertElementVisible(this.dashboardContent);
    await this.assertElementVisible(this.userDropdown);
  }

  /**
   * Get all available menu items
   * @returns Array of menu item names
   */
  async getAvailableMenuItems(): Promise<string[]> {
    const menuItems = await this.menuItems.all();
    const menuNames: string[] = [];

    for (const item of menuItems) {
      const text = await item.textContent();
      if (text && text.trim()) {
        menuNames.push(text.trim());
      }
    }

    return menuNames;
  }

  /**
   * Check if specific menu item is visible
   * @param menuName - Name of menu item to check
   * @returns True if menu item is visible
   */
  async isMenuItemVisible(menuName: string): Promise<boolean> {
    const menuItem = this.getMainMenuItem(menuName);
    return await menuItem.isVisible();
  }

  /**
   * Get current user information
   * @returns User information object
   */
  async getUserInfo(): Promise<{
    isLoggedIn: boolean;
    userDropdownVisible: boolean;
  }> {
    return {
      isLoggedIn: await this.userDropdown.isVisible(),
      userDropdownVisible: await this.userDropdown.isVisible()
    };
  }

  /**
   * Wait for specific module to load after navigation
   * @param moduleName - Name of the module to wait for
   */
  async waitForModuleLoad(moduleName: string): Promise<void> {
    // Wait for URL change
    await this.waitForUrl(new RegExp(moduleName.toLowerCase()));

    // Wait for page content to load
    await this.waitForNetworkIdle();
  }

  /**
   * Navigate to module and verify it loaded with enhanced error handling
   * @param moduleName - Name of the module to navigate to
   * @param options - Navigation options
   */
  async navigateToModule(
    moduleName: string,
    options: {
      retries?: number;
      takeScreenshot?: boolean;
      validateNavigation?: boolean;
    } = {}
  ): Promise<void> {
    const { retries = 3, takeScreenshot = false, validateNavigation = true } = options;

    try {
      // Navigate to module
      await this.clickMenu(moduleName, {
        retries,
        waitForNavigation: true,
        takeScreenshot
      });

      // Wait for module to load
      await this.waitForModuleLoad(moduleName);

      if (validateNavigation) {
        // Verify navigation was successful
        await this.verifyModuleNavigation(moduleName);
      }

      if (takeScreenshot) {
        await this.takeScreenshotEnhanced(`module-loaded-${moduleName.toLowerCase()}`);
      }
    } catch (error) {
      console.error(`Failed to navigate to module "${moduleName}":`, error);
      if (takeScreenshot) {
        await this.takeScreenshotEnhanced(
          `module-navigation-failed-${moduleName.toLowerCase()}`
        );
      }
      throw error;
    }
  }

  /**
   * Verify module navigation was successful
   * @param moduleName - Name of the module to verify
   */
  async verifyModuleNavigation(moduleName: string): Promise<void> {
    try {
      // Check URL contains module name
      const currentUrl = this.getCurrentUrl();
      const moduleUrlPattern = new RegExp(moduleName.toLowerCase(), "i");

      if (!moduleUrlPattern.test(currentUrl)) {
        throw new Error(
          `Navigation verification failed: URL "${currentUrl}" does not contain module "${moduleName}"`
        );
      }

      // Wait for page content to load
      await this.waitForPageLoad();

      // Check for any error messages
      const errorMessage = this.getErrorMessage();
      if (await errorMessage.isVisible()) {
        const errorText = await this.getElementText(errorMessage);
        throw new Error(`Module navigation failed with error: ${errorText}`);
      }
    } catch (error) {
      console.error(
        `Module navigation verification failed for "${moduleName}":`,
        error
      );
      throw error;
    }
  }

  /**
   * Get dashboard widget information
   * @returns Dashboard widget data
   */
  async getDashboardWidgets(): Promise<{
    quickLaunchVisible: boolean;
    employeeDistributionVisible: boolean;
    pendingRequestsVisible: boolean;
  }> {
    return {
      quickLaunchVisible: await this.quickLaunch.isVisible(),
      employeeDistributionVisible: await this.employeeDistribution.isVisible(),
      pendingRequestsVisible: await this.pendingRequests.isVisible()
    };
  }
}
