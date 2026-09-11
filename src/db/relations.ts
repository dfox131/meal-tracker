import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  meals: {
    mealFoodItems: r.many.mealFoodItems(),
  },
  foodItems: {
    mealFoodItems: r.many.mealFoodItems(),
  },
  mealFoodItems: {
    meal: r.one.meals({
      from: r.mealFoodItems.mealId,
      to: r.meals.id,
    }),
    foodItem: r.one.foodItems({
      from: r.mealFoodItems.foodItemId,
      to: r.foodItems.id,
    }),
  },
}));
