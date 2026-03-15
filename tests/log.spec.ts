import { test, expect } from "@playwright/test";

test.describe("Log Workout page", () => {
  test("renders the log workout form", async ({ page }) => {
    await page.goto("/log");

    await expect(page.getByRole("heading", { name: "Log Workout Session" })).toBeVisible();
    await expect(page.getByTestId("session-title-input")).toBeVisible();
    await expect(page.getByTestId("session-date-input")).toBeVisible();
    await expect(page.getByTestId("session-duration-input")).toBeVisible();
    await expect(page.getByTestId("submit-log-btn")).toBeVisible();
  });

  test("default date is today", async ({ page }) => {
    await page.goto("/log");

    const today = new Date().toISOString().split("T")[0];
    await expect(page.getByTestId("session-date-input")).toHaveValue(today);
  });

  test("default duration is 45 minutes", async ({ page }) => {
    await page.goto("/log");
    await expect(page.getByTestId("session-duration-input")).toHaveValue("45");
  });

  test("can add additional exercises", async ({ page }) => {
    await page.goto("/log");

    const initialCount = await page.getByTestId("exercise-log-item").count();
    await page.getByTestId("add-exercise-btn").click();
    const newCount = await page.getByTestId("exercise-log-item").count();
    expect(newCount).toBe(initialCount + 1);
  });

  test("shows validation error when title is empty", async ({ page }) => {
    await page.goto("/log");

    // Fill in exercise name but not title
    await page.getByTestId("exercise-name-input").first().fill("Push-ups");
    await page.getByTestId("submit-log-btn").click();

    // HTML5 validation will prevent submission (required field)
    await expect(page.getByTestId("session-title-input")).toBeFocused();
  });

  test("star rating buttons are present", async ({ page }) => {
    await page.goto("/log");

    for (let i = 1; i <= 5; i++) {
      await expect(page.getByTestId(`rating-${i}`)).toBeVisible();
    }
  });

  test("can click a rating star", async ({ page }) => {
    await page.goto("/log");

    await page.getByTestId("rating-3").click();
    // After clicking, the first 3 stars should be fully opaque
    await expect(page.getByTestId("rating-1")).toHaveClass(/opacity-100/);
    await expect(page.getByTestId("rating-3")).toHaveClass(/opacity-100/);
    await expect(page.getByTestId("rating-4")).toHaveClass(/opacity-30/);
  });
});
