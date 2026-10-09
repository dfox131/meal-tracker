import { notFound } from "next/navigation";
import { z } from "zod";

import { getFoodItemsForCurrentUser } from "@/data/food-items";
import { getMealForCurrentUserById } from "@/data/meals";
import { EditMealForm } from "./edit-meal-form";
import { MealFoodItems } from "./meal-food-items";

export default async function EditMealPage(
  props: PageProps<"/dashboard/meals/[mealId]">
) {
  const { mealId } = await props.params;

  // Avoid sending a malformed id to Postgres, which would error on the uuid cast.
  if (!z.guid().safeParse(mealId).success) {
    notFound();
  }

  const [meal, foodItems] = await Promise.all([
    getMealForCurrentUserById(mealId),
    getFoodItemsForCurrentUser(),
  ]);

  if (!meal) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Edit meal</h1>
        <p className="text-sm text-muted-foreground">
          Update the details of this meal and log what you ate.
        </p>
      </div>

      <EditMealForm meal={meal} />

      <MealFoodItems meal={meal} foodItems={foodItems} />
    </div>
  );
}
