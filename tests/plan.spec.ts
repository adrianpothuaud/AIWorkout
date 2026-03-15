import { test, expect } from "@playwright/test";

test.describe("Workout Plan page", () => {
  test("renders the plan generation form", async ({ page }) => {
    await page.goto("/plan");

    await expect(page.getByRole("heading", { name: "Generate Workout Plan" })).toBeVisible();

    // Fitness level buttons
    await expect(page.getByTestId("level-beginner")).toBeVisible();
    await expect(page.getByTestId("level-intermediate")).toBeVisible();
    await expect(page.getByTestId("level-advanced")).toBeVisible();

    // Generate button
    await expect(page.getByTestId("generate-btn")).toBeVisible();
  });

  test("selecting fitness level highlights the correct button", async ({ page }) => {
    await page.goto("/plan");

    await page.getByTestId("level-intermediate").click();
    await expect(page.getByTestId("level-intermediate")).toHaveClass(/bg-indigo-600/);
    await expect(page.getByTestId("level-beginner")).not.toHaveClass(/bg-indigo-600/);
  });

  test("duration slider is present and functional", async ({ page }) => {
    await page.goto("/plan");

    const slider = page.getByTestId("duration-slider");
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("45");
  });

  test("shows validation error when goals are not selected", async ({ page }) => {
    await page.goto("/plan");

    // Don't select goals or equipment – click generate
    await page.getByTestId("generate-btn").click();

    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page.getByTestId("error-message")).toContainText("goal");
  });

  test("shows validation error when equipment is not selected", async ({ page }) => {
    await page.goto("/plan");

    // Select a goal but not equipment
    await page.getByTestId("goal-weight-loss").click();
    await page.getByTestId("generate-btn").click();

    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page.getByTestId("error-message")).toContainText("equipment");
  });

  test("restrictions textarea is present", async ({ page }) => {
    await page.goto("/plan");
    await expect(page.getByTestId("restrictions-input")).toBeVisible();
  });
});
