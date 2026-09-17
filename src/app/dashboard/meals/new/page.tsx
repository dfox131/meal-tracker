import { NewMealForm } from "./new-meal-form";

export default function NewMealPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">New meal</h1>
        <p className="text-sm text-muted-foreground">
          Log a meal you&apos;ve eaten.
        </p>
      </div>

      <NewMealForm />
    </div>
  );
}
