import { test, expect } from "@playwright/test";

test.describe("RAG-augmented plan generation", () => {
  test("plan page renders generate form correctly after RAG integration", async ({ page }) => {
    await page.goto("/plan");

    await expect(page.getByRole("heading", { name: "Generate Workout Plan" })).toBeVisible();
    await expect(page.getByTestId("level-beginner")).toBeVisible();
    await expect(page.getByTestId("generate-btn")).toBeVisible();
  });

  test("generate button still shows validation errors without goals", async ({ page }) => {
    await page.goto("/plan");

    await page.getByTestId("generate-btn").click();

    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page.getByTestId("error-message")).toContainText("goal");
  });

  test("generate button still shows validation errors without equipment", async ({ page }) => {
    await page.goto("/plan");

    await page.getByTestId("goal-weight-loss").click();
    await page.getByTestId("generate-btn").click();

    await expect(page.getByTestId("error-message")).toBeVisible();
    await expect(page.getByTestId("error-message")).toContainText("equipment");
  });

  test("personalized badge is not shown before plan is generated", async ({ page }) => {
    await page.goto("/plan");

    // Before any generation, the badge should not be present
    await expect(page.getByTestId("personalized-badge")).not.toBeVisible();
  });

  test("personalized badge appears when API returns personalized: true", async ({ page }) => {
    // Mock /api/generate to return a plan with personalized: true
    await page.route("/api/generate", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          personalized: true,
          plan: {
            title: "RAG-Personalised Full Body Workout",
            description: "Tailored based on your recent sessions.",
            totalDurationMinutes: 45,
            warmup: [
              {
                name: "Jumping Jacks",
                sets: 1,
                reps: "30 seconds",
                restSeconds: 10,
                instructions: "Jump and spread arms and legs.",
                muscleGroup: "Full Body",
              },
            ],
            mainWorkout: [
              {
                name: "Push-ups",
                sets: 3,
                reps: "15",
                restSeconds: 60,
                instructions: "Keep core tight.",
                muscleGroup: "Chest",
              },
            ],
            cooldown: [
              {
                name: "Child's Pose",
                sets: 1,
                reps: "60 seconds",
                restSeconds: 0,
                instructions: "Breathe deeply.",
                muscleGroup: "Back",
              },
            ],
            tips: ["Stay hydrated."],
          },
        }),
      });
    });

    await page.goto("/plan");

    // Select required fields
    await page.getByTestId("goal-weight-loss").click();
    await page.getByTestId("equipment-dumbbells").click();
    await page.getByTestId("generate-btn").click();

    // Wait for the generated plan to appear
    await expect(page.getByTestId("generated-plan")).toBeVisible({ timeout: 10000 });

    // Personalized badge should be visible
    await expect(page.getByTestId("personalized-badge")).toBeVisible();
    await expect(page.getByTestId("personalized-badge")).toContainText("Personalized for you");
  });
});
