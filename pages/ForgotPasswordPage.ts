// pages/ForgotPasswordPage.ts
import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the Forgot Password modal/page
 * Handles all interactions with the password reset functionality
 */
export class ForgotPasswordPage {
    readonly page: Page;
    readonly pageHeading: Locator;
    readonly usernameField: Locator;
    readonly cancelButton: Locator;
    readonly resetPasswordButton: Locator;
    readonly instructionText: Locator;

    /**
     * Creates new ForgotPasswordPage instance
     * param page - Playwright Page object representing browser tab
     */
    constructor(page: Page) {
        this.page = page;
        
        // Locate main heading using semantic role - most stable approach
        this.pageHeading = page.getByRole('heading', { name: /reset password/i });
        
        // Locate instruction text using partial text match with regex for flexibility
        this.instructionText = page.getByText(/please enter your username to identify/i);
        
        // Locate username field using multiple fallback strategies for maximum reliability
        this.usernameField = page.getByRole('textbox', { name: /username/i })
            .or(page.getByPlaceholder(/username/i))
            .or(page.locator('input[type="text"]'));
        
        // Locate cancel button using semantic role with case-insensitive text matching
        this.cancelButton = page.getByRole('button', { name: /cancel/i });
        
        // Locate reset password button using semantic role with regex pattern
        this.resetPasswordButton = page.getByRole('button', { name: /reset password/i });
    }

    /**
     * Fills the username field with provided text
     * Uses Playwright's auto-waiting mechanism to ensure element is ready
     * param username - Username string to enter in the field
     */
    async fillUsername(username: string): Promise<void> {
        await this.usernameField.fill(username);
    }

    /**
     * Clicks the reset password button and waits for network requests to complete
     * Handles form submission and potential page transitions
     */
    async clickResetPassword(): Promise<void> {
        await this.resetPasswordButton.click();
        // Wait for any network requests triggered by form submission to complete
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Clicks the cancel button and waits for modal to close or page navigation
     * Returns user to the previous state (usually login page)
     */
    async clickCancel(): Promise<void> {
        await this.cancelButton.click();
        // Wait for modal close animation or page navigation to complete
        await this.page.waitForLoadState('networkidle');
    }

    /**
     * Verifies that all required elements of the forgot password page are displayed
     * This method serves as a comprehensive page load verification
     * Throws assertion error if any required element is not visible
     */
    async verifyPageIsDisplayed(): Promise<void> {
        // Assert main heading is visible to confirm correct page/modal loaded
        await expect(this.pageHeading).toBeVisible();
        
        // Assert instruction text is present to ensure page content loaded properly
        await expect(this.instructionText).toBeVisible();
        
        // Assert username input field is visible and interactive
        await expect(this.usernameField).toBeVisible();
        
        // Assert cancel button is available for user to exit the flow
        await expect(this.cancelButton).toBeVisible();
        
        // Assert reset password button is present and ready for interaction
        await expect(this.resetPasswordButton).toBeVisible();
    }

    /**
     * Verifies that the username field has keyboard focus
     * Useful for testing accessibility and user experience
     * Expected behavior: field should be focused when page/modal opens
     */
    async verifyUsernameFieldIsFocused(): Promise<void> {
        await expect(this.usernameField).toBeFocused();
    }

    /**
     * Checks if the reset password button is currently enabled
     * Used for validating form state and button availability
     * @returns Promise<boolean> - true if button is enabled, false if disabled
     */
    async isResetButtonEnabled(): Promise<boolean> {
        return await this.resetPasswordButton.isEnabled();
    }

    /**
     * Verifies that appropriate error message is displayed for validation failures
     * @param expectedErrorMessage - Expected error text or regex pattern to match
     */
    async verifyErrorMessage(expectedErrorMessage: string | RegExp): Promise<void> {
        // Look for error message using multiple strategies for maximum coverage
        const errorMessage = this.page.getByRole('alert')
            .or(this.page.locator('.error, .alert-danger, [class*="error"]'))
            .or(this.page.getByText(expectedErrorMessage));
            
        await expect(errorMessage).toBeVisible();
    }

    /**
     * Verifies that success message is displayed after successful password reset request
     * param expectedSuccessMessage - Expected success text or regex pattern
     */
    async verifySuccessMessage(expectedSuccessMessage: string | RegExp): Promise<void> {
        // Look for success message using semantic role and fallback selectors
        const successMessage = this.page.getByRole('status')
            .or(this.page.locator('.success, .alert-success, [class*="success"]'))
            .or(this.page.getByText(expectedSuccessMessage));
            
        await expect(successMessage).toBeVisible();
    }
}