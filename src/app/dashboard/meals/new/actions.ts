"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createMeal } from "@/data/meals";
import { requireUserId } from "@/lib/auth";

const CreateMealInput = z.object({
  name: z.string().min(1, "Name is required"),
  eatenAt: z.coerce.date(),
});

type CreateMealInput = z.infer<typeof CreateMealInput>;

function formatDateParam(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function createMealAction(input: CreateMealInput) {
  await requireUserId();
  const data = CreateMealInput.parse(input);

  const meal = await createMeal(data);

  revalidatePath("/dashboard");
  redirect(`/dashboard?date=${formatDateParam(meal.eatenAt)}&created=1`);
}
