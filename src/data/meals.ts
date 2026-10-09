import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { meals } from "@/db/schema";
import { requireUserId } from "@/lib/auth";

export async function getMealsForCurrentUserByDate(date: Date) {
  const userId = await requireUserId();

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfNextDay = new Date(startOfDay);
  startOfNextDay.setDate(startOfNextDay.getDate() + 1);

  return db.query.meals.findMany({
    where: {
      userId,
      eatenAt: {
        gte: startOfDay,
        lt: startOfNextDay,
      },
    },
    with: {
      mealFoodItems: {
        with: {
          foodItem: true,
        },
      },
    },
    orderBy: { eatenAt: "desc" },
  });
}

export async function getMealForCurrentUserById(id: string) {
  const userId = await requireUserId();

  return db.query.meals.findFirst({
    where: { id, userId },
    with: {
      mealFoodItems: {
        with: {
          foodItem: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function createMeal(data: { name: string; eatenAt: Date }) {
  const userId = await requireUserId();

  const [meal] = await db
    .insert(meals)
    .values({ ...data, userId })
    .returning();

  return meal;
}

export async function updateMeal(
  id: string,
  data: { name: string; eatenAt: Date }
) {
  const userId = await requireUserId();

  const [meal] = await db
    .update(meals)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(meals.id, id), eq(meals.userId, userId)))
    .returning();

  return meal;
}
