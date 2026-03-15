import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("renders hero section and navigation", async ({ page }) => {
    await page.goto("/");

    // Check page title
    await expect(page).toHaveTitle(/AIWorkout/);

    // Check hero heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("AI-Powered");

    // Check CTA buttons
    await expect(page.getByTestId("cta-generate")).toBeVisible();
    await expect(page.getByTestId("cta-dashboard")).toBeVisible();
  });

  test("CTA generate button navigates to plan page", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("cta-generate").click();
    await expect(page).toHaveURL("/plan");
  });

  test("CTA dashboard button navigates to dashboard", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("cta-dashboard").click();
    await expect(page).toHaveURL("/dashboard");
  });

  test("feature cards are displayed", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "AI-Powered Planning" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Progress Tracking" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Works Offline" })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navbar is present on all pages", async ({ page }) => {
    for (const path of ["/", "/plan", "/log"]) {
      await page.goto(path);
      await expect(page.getByTestId("nav-home")).toBeVisible();
      await expect(page.getByTestId("nav-plan")).toBeVisible();
    }
  });

  test("active nav item is highlighted on plan page", async ({ page }) => {
    await page.goto("/plan");
    const planLink = page.getByTestId("nav-plan");
    await expect(planLink).toHaveClass(/text-indigo-400/);
  });
});
