"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createMeal } from "@/data/meals";
import { requireUserId } from "@/lib/auth";
import { formatDateParamInTimeZone } from "@/lib/dates";
import { getUserTimeZone } from "@/lib/timezone";

const CreateMealInput = z.object({
  name: z.string().min(1, "Name is required"),
  eatenAt: z.coerce.date(),
});

type CreateMealInput = z.infer<typeof CreateMealInput>;

export async function createMealAction(input: CreateMealInput) {
  await requireUserId();
  const data = CreateMealInput.parse(input);

  const meal = await createMeal(data);

  revalidatePath("/dashboard");
  // Return to the meal's calendar day in the user's timezone, not the server's.
  const date = formatDateParamInTimeZone(meal.eatenAt, await getUserTimeZone());
  redirect(`/dashboard?date=${date}&created=1`);
}
