import "server-only";
import { db } from "@/db";
import { foodItems } from "@/db/schema";
import { requireUserId } from "@/lib/auth";

export async function getFoodItemsForCurrentUser() {
  const userId = await requireUserId();

  return db.query.foodItems.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createFoodItem(data: { name: string; calories: number }) {
  const userId = await requireUserId();

  const [foodItem] = await db
    .insert(foodItems)
    .values({ ...data, userId })
    .returning();

  return foodItem;
}
