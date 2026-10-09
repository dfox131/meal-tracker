import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { mealFoodItems } from "@/db/schema";
import { requireUserId } from "@/lib/auth";

// meal_food_items has no user_id column, so ownership is enforced through the
// parent meal (and the food item, which is also user-scoped).
async function isMealOwnedByUser(mealId: string, userId: string) {
  const meal = await db.query.meals.findFirst({
    where: { id: mealId, userId },
    columns: { id: true },
  });

  return Boolean(meal);
}

export async function addFoodItemToMeal(
  mealId: string,
  data: { foodItemId: string; quantity: number }
) {
  const userId = await requireUserId();

  const [mealOwned, foodItem] = await Promise.all([
    isMealOwnedByUser(mealId, userId),
    db.query.foodItems.findFirst({
      where: { id: data.foodItemId, userId },
      columns: { id: true },
    }),
  ]);

  if (!mealOwned || !foodItem) {
    return null;
  }

  const [mealFoodItem] = await db
    .insert(mealFoodItems)
    .values({
      mealId,
      foodItemId: data.foodItemId,
      quantity: String(data.quantity),
    })
    .returning();

  return mealFoodItem;
}

export async function removeFoodItemFromMeal(
  mealId: string,
  mealFoodItemId: string
) {
  const userId = await requireUserId();

  if (!(await isMealOwnedByUser(mealId, userId))) {
    return null;
  }

  const [mealFoodItem] = await db
    .delete(mealFoodItems)
    .where(
      and(
        eq(mealFoodItems.id, mealFoodItemId),
        eq(mealFoodItems.mealId, mealId)
      )
    )
    .returning();

  return mealFoodItem ?? null;
}
