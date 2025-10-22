import { Page } from "@playwright/test";

/**
 * Test data management utilities for Playwright tests
 * Provides comprehensive test data generation, validation, and management
 */
export class TestDataManager {
  private static testData: Map<string, any> = new Map();
  private static dataGenerators: Map<string, () => any> = new Map();

  /**
   * Register a data generator function
   * @param key - Data key
   * @param generator - Generator function
   */
  static registerGenerator(key: string, generator: () => any): void {
    this.dataGenerators.set(key, generator);
  }

  /**
   * Generate test data with enhanced options
   * @param type - Type of data to generate
   * @param options - Generation options
   * @returns Generated test data
   */
  static generateData(
    type: "employee" | "user" | "leave" | "performance" | "admin" | "custom",
    options: {
      prefix?: string;
      includeTimestamp?: boolean;
      customFields?: Record<string, any>;
      unique?: boolean;
      count?: number;
    } = {}
  ): any {
    const {
      prefix = "Test",
      includeTimestamp = true,
      customFields = {},
      unique = true,
      count = 1
    } = options;

    const timestamp = includeTimestamp ? Date.now() : "";
    const uniqueId = unique ? Math.random().toString(36).substr(2, 9) : "";

    const baseData = (() => {
      switch (type) {
        case "employee":
          return {
            firstName: `${prefix}${timestamp}${uniqueId}`,
            lastName: `User${timestamp}${uniqueId}`,
            employeeId: `EMP${timestamp}${uniqueId}`,
            email: `test${timestamp}${uniqueId}@example.com`,
            middleName: `Middle${timestamp}${uniqueId}`,
            nickname: `Nick${timestamp}${uniqueId}`,
            otherId: `OTH${timestamp}${uniqueId}`,
            driverLicenseNumber: `DL${timestamp}${uniqueId}`,
            licenseExpiryDate: "2025-12-31",
            gender: "Male",
            maritalStatus: "Single",
            nationality: "American",
            dateOfBirth: "1990-01-01",
            address: {
              street: "123 Test Street",
              city: "Test City",
              state: "Test State",
              zipCode: "12345",
              country: "United States"
            },
            contact: {
              homePhone: "555-123-4567",
              mobilePhone: "555-987-6543",
              workPhone: "555-456-7890",
              workEmail: `work${timestamp}${uniqueId}@example.com`,
              otherEmail: `other${timestamp}${uniqueId}@example.com`
            }
          };
        case "user":
          return {
            username: `${prefix}User${timestamp}${uniqueId}`,
            password: `TestPass${timestamp}${uniqueId}!`,
            confirmPassword: `TestPass${timestamp}${uniqueId}!`,
            userRole: "Admin",
            status: "Enabled",
            employeeName: `${prefix} Employee${timestamp}${uniqueId}`,
            email: `user${timestamp}${uniqueId}@example.com`
          };
        case "leave":
          return {
            leaveType: "Annual Leave",
            fromDate: "2024-01-01",
            toDate: "2024-01-05",
            comment: `${prefix} leave request ${timestamp}${uniqueId}`,
            duration: "5 days",
            status: "Pending"
          };
        case "performance":
          return {
            employeeName: `${prefix} Employee ${timestamp}${uniqueId}`,
            reviewPeriod: "2024",
            jobTitle: "Test Engineer",
            department: "Engineering",
            reviewDate: "2024-12-31",
            reviewer: "Test Manager",
            goals: [
              "Complete project on time",
              "Improve team collaboration",
              "Enhance technical skills"
            ],
            achievements: [
              "Successfully delivered project",
              "Improved team efficiency",
              "Completed training program"
            ]
          };
        case "admin":
          return {
            username: `admin${timestamp}${uniqueId}`,
            password: `AdminPass${timestamp}${uniqueId}!`,
            userRole: "Admin",
            status: "Enabled",
            employeeName: `Admin User ${timestamp}${uniqueId}`,
            email: `admin${timestamp}${uniqueId}@example.com`
          };
        case "custom":
          return customFields;
        default:
          return {};
      }
    })();

    const finalData = { ...baseData, ...customFields };

    if (count > 1) {
      return Array.from({ length: count }, (_, index) => ({
        ...finalData,
        id: index + 1,
        uniqueId: `${uniqueId}_${index + 1}`
      }));
    }

    return finalData;
  }

  /**
   * Store test data
   * @param key - Data key
   * @param data - Data to store
   */
  static storeData(key: string, data: any): void {
    this.testData.set(key, data);
  }

  /**
   * Retrieve test data
   * @param key - Data key
   * @returns Stored data
   */
  static getData(key: string): any {
    return this.testData.get(key);
  }

  /**
   * Clear test data
   * @param key - Optional specific key to clear
   */
  static clearData(key?: string): void {
    if (key) {
      this.testData.delete(key);
    } else {
      this.testData.clear();
    }
  }

  /**
   * Validate test data structure
   * @param data - Data to validate
   * @param schema - Expected schema
   * @returns Validation result
   */
  static validateData(
    data: any,
    schema: Record<string, string>
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [key, expectedType] of Object.entries(schema)) {
      if (!(key in data)) {
        errors.push(`Missing required field: ${key}`);
        continue;
      }

      const actualType = typeof data[key];
      if (actualType !== expectedType) {
        errors.push(`Field ${key} expected type ${expectedType}, got ${actualType}`);
      }

      // Additional validation for specific fields
      if (key === "email" && data[key]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data[key])) {
          warnings.push(`Email format may be invalid: ${data[key]}`);
        }
      }

      if (key === "password" && data[key]) {
        if (data[key].length < 8) {
          warnings.push(`Password may be too short: ${data[key].length} characters`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate random string
   * @param length - String length
   * @param charset - Character set
   * @returns Random string
   */
  static generateRandomString(
    length: number = 10,
    charset: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  ): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generate random number
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Random number
   */
  static generateRandomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random date
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Random date string
   */
  static generateRandomDate(
    startDate: string = "2020-01-01",
    endDate: string = "2025-12-31"
  ): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomTime =
      start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString().split("T")[0];
  }

  /**
   * Generate random email
   * @param domain - Email domain
   * @returns Random email
   */
  static generateRandomEmail(domain: string = "example.com"): string {
    const username = this.generateRandomString(
      8,
      "abcdefghijklmnopqrstuvwxyz0123456789"
    );
    return `${username}@${domain}`;
  }

  /**
   * Generate random phone number
   * @param format - Phone number format
   * @returns Random phone number
   */
  static generateRandomPhone(format: string = "XXX-XXX-XXXX"): string {
    return format.replace(/X/g, () => Math.floor(Math.random() * 10).toString());
  }

  /**
   * Generate test data for specific test scenario
   * @param scenario - Test scenario
   * @param options - Generation options
   * @returns Generated test data
   */
  static generateScenarioData(
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
    const { count = 1, customFields = {} } = options;

    const scenarioData = (() => {
      switch (scenario) {
        case "login":
          return {
            validCredentials: {
              username: "Admin",
              password: "admin123"
            },
            invalidCredentials: {
              username: "InvalidUser",
              password: "wrongpassword"
            },
            emptyCredentials: {
              username: "",
              password: ""
            }
          };
        case "registration":
          return this.generateData("user", { count, customFields });
        case "employee_creation":
          return this.generateData("employee", { count, customFields });
        case "leave_request":
          return this.generateData("leave", { count, customFields });
        case "performance_review":
          return this.generateData("performance", { count, customFields });
        default:
          return {};
      }
    })();

    return scenarioData;
  }

  /**
   * Get data summary
   * @returns Data summary
   */
  static getDataSummary(): {
    totalEntries: number;
    entriesByType: Record<string, number>;
    memoryUsage: number;
  } {
    const entriesByType: Record<string, number> = {};
    let totalEntries = 0;

    this.testData.forEach((data, key) => {
      totalEntries++;
      const type = typeof data;
      entriesByType[type] = (entriesByType[type] || 0) + 1;
    });

    return {
      totalEntries,
      entriesByType,
      memoryUsage: JSON.stringify(this.testData).length
    };
  }

  /**
   * Export test data to file
   * @param filename - Output filename
   */
  static async exportData(filename: string): Promise<void> {
    try {
      const fs = require("fs");
      const path = require("path");

      const dir = path.dirname(filename);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const exportData = {
        timestamp: new Date().toISOString(),
        data: Object.fromEntries(this.testData),
        summary: this.getDataSummary()
      };

      fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    } catch (error) {
      console.error("Failed to export test data:", error);
    }
  }

  /**
   * Import test data from file
   * @param filename - Input filename
   */
  static async importData(filename: string): Promise<void> {
    try {
      const fs = require("fs");
      const data = JSON.parse(fs.readFileSync(filename, "utf8"));

      if (data.data) {
        this.testData = new Map(Object.entries(data.data));
      }
    } catch (error) {
      console.error("Failed to import test data:", error);
    }
  }
}

/**
 * Test data schemas for validation
 */
export const TEST_DATA_SCHEMAS = {
  EMPLOYEE: {
    firstName: "string",
    lastName: "string",
    employeeId: "string",
    email: "string"
  },
  USER: {
    username: "string",
    password: "string",
    userRole: "string",
    status: "string"
  },
  LEAVE: {
    leaveType: "string",
    fromDate: "string",
    toDate: "string",
    comment: "string"
  },
  PERFORMANCE: {
    employeeName: "string",
    reviewPeriod: "string",
    jobTitle: "string"
  }
} as const;
