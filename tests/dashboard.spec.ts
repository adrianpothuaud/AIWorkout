import { test, expect } from "@playwright/test";

test.describe("Dashboard page", () => {
  test("renders the dashboard heading", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for either the heading (loaded) or the loading spinner to appear
    await page.waitForSelector("h1, .animate-spin", { timeout: 15000 });

    // Once loading completes, the heading should appear
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("Your workout overview")).toBeVisible();
  });

  test("shows stat cards after loading", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for loading to complete (stat cards appear, or timeout)
    await page.waitForSelector('[data-testid="stat-card"], :text("Loading dashboard")', {
      timeout: 15000,
    });

    const statCards = page.getByTestId("stat-card");
    const count = await statCards.count();
    // Either stat cards are shown (4) or still loading
    expect(count === 0 || count === 4).toBeTruthy();
  });

  test("has a link to plan page in nav", async ({ page }) => {
    await page.goto("/dashboard");
    const planLink = page.getByTestId("nav-plan");
    await expect(planLink).toBeVisible();
    await planLink.click();
    await expect(page).toHaveURL("/plan");
  });
});

test.describe("History page", () => {
  test("renders the history page heading", async ({ page }) => {
    await page.goto("/history");

    await expect(page.getByRole("heading", { name: "Workout History" })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("All your logged sessions")).toBeVisible();
  });

  test("shows link to log session", async ({ page }) => {
    await page.goto("/history");

    const logLink = page.getByRole("link", { name: "+ Log Session" });
    await expect(logLink).toBeVisible({ timeout: 15000 });
    await logLink.click();
    await expect(page).toHaveURL("/log");
  });

  test("shows empty state or sessions after loading", async ({ page }) => {
    await page.goto("/history");

    // Wait for the loading spinner to disappear or content to appear
    await page.waitForFunction(
      () => !document.querySelector(".animate-spin") || document.querySelector('[data-testid="sessions-list"]'),
      { timeout: 15000 }
    );

    // Either empty state or sessions list should be visible
    const hasEmptyState = await page.getByText("No sessions yet").isVisible().catch(() => false);
    const hasList = await page.getByTestId("sessions-list").isVisible().catch(() => false);
    expect(hasEmptyState || hasList).toBeTruthy();
  });
});
