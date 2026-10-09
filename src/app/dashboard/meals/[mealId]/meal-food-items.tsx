"use client";

import { useTransition } from "react";
import { Trash2Icon, UtensilsIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getMealForCurrentUserById } from "@/data/meals";
import type { FoodItem } from "@/db/schema";
import { getMealCalories, getMealFoodItemCalories } from "@/lib/meals";

import { AddFoodItemForm } from "./add-food-item-form";
import { removeFoodItemFromMealAction } from "./actions";

type MealWithFoodItems = NonNullable<
  Awaited<ReturnType<typeof getMealForCurrentUserById>>
>;

export function MealFoodItems({
  meal,
  foodItems,
}: {
  meal: MealWithFoodItems;
  foodItems: Pick<FoodItem, "id" | "name" | "calories">[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = (mealFoodItemId: string) => {
    startTransition(async () => {
      try {
        await removeFoodItemFromMealAction({
          mealId: meal.id,
          mealFoodItemId,
        });
        toast.success("Food item removed");
      } catch {
        toast.error("Couldn't remove food item. Please try again.");
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle>Food items</CardTitle>
        <Badge variant="secondary">{getMealCalories(meal)} kcal total</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {meal.mealFoodItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
            <UtensilsIcon className="size-8" />
            <p className="text-sm">No food items logged for this meal.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {meal.mealFoodItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{item.foodItem?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {Number(item.quantity)} × {item.foodItem?.calories ?? 0}{" "}
                    kcal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {getMealFoodItemCalories(item)} kcal
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${item.foodItem?.name ?? "food item"}`}
                    onClick={() => handleRemove(item.id)}
                    disabled={isPending}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <AddFoodItemForm mealId={meal.id} foodItems={foodItems} />
      </CardContent>
    </Card>
  );
}
