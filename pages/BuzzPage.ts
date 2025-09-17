import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class BuzzPage extends BasePage {
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeading = this.page
      .locator(".oxd-topbar-header-breadcrumb-module")
      .getByText("Buzz");
  }
}
