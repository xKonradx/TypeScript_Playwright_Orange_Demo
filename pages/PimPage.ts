import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class PimPage extends BasePage {
  readonly employeeListTab: Locator;

  constructor(page: Page) {
    super(page);
    this.employeeListTab = this.getText("Employee List");
  }
}
