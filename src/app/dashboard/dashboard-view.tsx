"use client";

import { useRouter } from "next/navigation";
import { CalendarIcon, UtensilsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { getMealsForCurrentUserByDate } from "@/data/meals";

type MealWithFoodItems = Awaited<
  ReturnType<typeof getMealsForCurrentUserByDate>
>[number];

function getMealCalories(meal: MealWithFoodItems) {
  return meal.mealFoodItems.reduce((sum, item) => {
    const calories = item.foodItem?.calories ?? 0;
    return sum + calories * Number(item.quantity);
  }, 0);
}

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function DashboardView({
  meals,
  date,
}: {
  meals: MealWithFoodItems[];
  date: Date;
}) {
  const router = useRouter();

  const totalCalories = meals.reduce(
    (sum, meal) => sum + getMealCalories(meal),
    0
  );

  const handleSelectDate = (selected: Date | undefined) => {
    if (!selected) return;
    router.push(`/dashboard?date=${formatDateParam(selected)}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your meals for the day.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal sm:w-[240px]"
              />
            }
          >
            <CalendarIcon className="mr-2 size-4" />
            {date.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelectDate}
              autoFocus
            />
          </PopoverContent>
        </Popover>

        <Badge variant="secondary" className="w-fit">
          {totalCalories} kcal total
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meals</CardTitle>
        </CardHeader>
        <CardContent>
          {meals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <UtensilsIcon className="size-8" />
              <p className="text-sm">No meals logged for this date.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              <ul className="flex flex-col gap-3">
                {meals.map((meal) => (
                  <li
                    key={meal.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{meal.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(meal.eatenAt).toLocaleTimeString(undefined, {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getMealCalories(meal)} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
