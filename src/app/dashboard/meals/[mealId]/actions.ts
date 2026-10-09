"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createFoodItem } from "@/data/food-items";
import {
  addFoodItemToMeal,
  removeFoodItemFromMeal,
} from "@/data/meal-food-items";
import { updateMeal } from "@/data/meals";
import { requireUserId } from "@/lib/auth";

// IDs use z.guid() rather than z.uuid(): Postgres's uuid type accepts any
// 8-4-4-4-12 hex value (e.g. seeded ids), but z.uuid() enforces RFC version/variant bits.
const UpdateMealInput = z.object({
  id: z.guid(),
  name: z.string().min(1, "Name is required"),
  eatenAt: z.coerce.date(),
});

type UpdateMealInput = z.infer<typeof UpdateMealInput>;

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function updateMealAction(input: UpdateMealInput) {
  await requireUserId();
  const { id, ...data } = UpdateMealInput.parse(input);

  const meal = await updateMeal(id, data);

  if (!meal) {
    throw new Error("Meal not found");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/meals/${id}`);
  redirect(`/dashboard?date=${formatDateParam(meal.eatenAt)}`);
}

const AddFoodItemToMealInput = z.object({
  mealId: z.guid(),
  quantity: z.number().positive("Quantity must be greater than 0"),
  foodItem: z.discriminatedUnion("type", [
    z.object({ type: z.literal("existing"), id: z.guid() }),
    z.object({
      type: z.literal("new"),
      name: z.string().trim().min(1, "Name is required"),
      calories: z.number().int().nonnegative(),
    }),
  ]),
});

type AddFoodItemToMealInput = z.infer<typeof AddFoodItemToMealInput>;

export async function addFoodItemToMealAction(input: AddFoodItemToMealInput) {
  await requireUserId();
  const { mealId, quantity, foodItem } = AddFoodItemToMealInput.parse(input);

  const foodItemId =
    foodItem.type === "existing"
      ? foodItem.id
      : (
          await createFoodItem({
            name: foodItem.name,
            calories: foodItem.calories,
          })
        ).id;

  const mealFoodItem = await addFoodItemToMeal(mealId, {
    foodItemId,
    quantity,
  });

  if (!mealFoodItem) {
    throw new Error("Meal not found");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/meals/${mealId}`);
}

const RemoveFoodItemFromMealInput = z.object({
  mealId: z.guid(),
  mealFoodItemId: z.guid(),
});

type RemoveFoodItemFromMealInput = z.infer<typeof RemoveFoodItemFromMealInput>;

export async function removeFoodItemFromMealAction(
  input: RemoveFoodItemFromMealInput
) {
  await requireUserId();
  const { mealId, mealFoodItemId } = RemoveFoodItemFromMealInput.parse(input);

  const mealFoodItem = await removeFoodItemFromMeal(mealId, mealFoodItemId);

  if (!mealFoodItem) {
    throw new Error("Food item not found");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/meals/${mealId}`);
}
