"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { updateMeal } from "@/data/meals";
import { requireUserId } from "@/lib/auth";

const UpdateMealInput = z.object({
  id: z.uuid(),
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
