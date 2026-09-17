import "server-only";
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

export async function createMeal(data: { name: string; eatenAt: Date }) {
  const userId = await requireUserId();

  const [meal] = await db
    .insert(meals)
    .values({ ...data, userId })
    .returning();

  return meal;
}
