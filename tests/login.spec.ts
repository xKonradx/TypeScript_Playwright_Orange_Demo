import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test(
  "TC_LOGIN_001: Valid Login redirects to dashboard",
  {
    tag: ["@login", "@smoke"]
  },
  async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login("Admin", "admin123");

    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  }
);
