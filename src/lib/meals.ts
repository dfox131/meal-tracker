type MealWithFoodItemCalories = {
  mealFoodItems: {
    quantity: string;
    foodItem: { calories: number | null } | null;
  }[];
};

export function getMealFoodItemCalories(item: {
  quantity: string;
  foodItem: { calories: number | null } | null;
}) {
  return Math.round((item.foodItem?.calories ?? 0) * Number(item.quantity));
}

export function getMealCalories(meal: MealWithFoodItemCalories) {
  return meal.mealFoodItems.reduce(
    (sum, item) => sum + getMealFoodItemCalories(item),
    0
  );
}
