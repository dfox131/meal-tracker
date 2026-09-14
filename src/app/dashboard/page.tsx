"use client";

import { useState } from "react";
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

type Meal = {
  id: string;
  name: string;
  category: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  time: string;
};

const placeholderMeals: Meal[] = [
  {
    id: "1",
    name: "Oatmeal with berries",
    category: "Breakfast",
    calories: 320,
    time: "7:30 AM",
  },
  {
    id: "2",
    name: "Grilled chicken salad",
    category: "Lunch",
    calories: 480,
    time: "12:15 PM",
  },
  {
    id: "3",
    name: "Greek yogurt",
    category: "Snack",
    calories: 150,
    time: "3:00 PM",
  },
  {
    id: "4",
    name: "Salmon with roasted vegetables",
    category: "Dinner",
    calories: 610,
    time: "7:00 PM",
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const totalCalories = placeholderMeals.reduce(
    (sum, meal) => sum + meal.calories,
    0
  );

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
            {date
              ? date.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Pick a date"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
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
          {placeholderMeals.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <UtensilsIcon className="size-8" />
              <p className="text-sm">No meals logged for this date.</p>
            </div>
          ) : (
            <ScrollArea className="max-h-96">
              <ul className="flex flex-col gap-3">
                {placeholderMeals.map((meal) => (
                  <li
                    key={meal.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{meal.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {meal.time}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline">{meal.category}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {meal.calories} kcal
                      </span>
                    </div>
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
