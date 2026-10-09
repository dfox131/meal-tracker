"use client";

import { useMemo, useState, useTransition } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FoodItem } from "@/db/schema";

import { addFoodItemToMealAction } from "./actions";

type FoodItemOption =
  | { type: "existing"; id: string; name: string; calories: number | null }
  | { type: "new"; id: "new"; name: string };

export function AddFoodItemForm({
  mealId,
  foodItems,
}: {
  mealId: string;
  foodItems: Pick<FoodItem, "id" | "name" | "calories">[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<FoodItemOption | null>(null);
  const [calories, setCalories] = useState("");
  const [quantity, setQuantity] = useState("1");

  const options = useMemo<FoodItemOption[]>(() => {
    const trimmed = query.trim();
    const normalized = trimmed.toLowerCase();

    const existing: FoodItemOption[] = foodItems
      .filter((item) => item.name.toLowerCase().includes(normalized))
      .map((item) => ({ type: "existing", ...item }));

    const hasExactMatch = foodItems.some(
      (item) => item.name.toLowerCase() === normalized
    );

    return trimmed && !hasExactMatch
      ? [...existing, { type: "new", id: "new", name: trimmed }]
      : existing;
  }, [foodItems, query]);

  const resetForm = () => {
    setQuery("");
    setSelected(null);
    setCalories("");
    setQuantity("1");
  };

  const handleSubmit = (formEvent: React.FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    setError(null);

    if (!selected) {
      setError("Choose a food item or create a new one");
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    const parsedCalories = Number(calories);
    if (
      selected.type === "new" &&
      (calories === "" ||
        !Number.isInteger(parsedCalories) ||
        parsedCalories < 0)
    ) {
      setError("Calories must be a whole number of 0 or more");
      return;
    }

    startTransition(async () => {
      try {
        await addFoodItemToMealAction({
          mealId,
          quantity: parsedQuantity,
          foodItem:
            selected.type === "existing"
              ? { type: "existing", id: selected.id }
              : { type: "new", name: selected.name, calories: parsedCalories },
        });
        resetForm();
        toast.success("Food item added");
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="foodItem">Food item</Label>
        <Combobox<FoodItemOption>
          items={options}
          filter={null}
          value={selected}
          onValueChange={(value) => setSelected(value)}
          inputValue={query}
          onInputValueChange={(value) => {
            setQuery(value);
            if (selected && value !== selected.name) {
              setSelected(null);
            }
          }}
          itemToStringLabel={(item) => item.name}
          isItemEqualToValue={(item, value) =>
            item.type === value.type && item.id === value.id
          }
        >
          <ComboboxInput
            id="foodItem"
            placeholder="Search or create a food item"
            disabled={isPending}
            className="w-full"
          />
          <ComboboxContent>
            <ComboboxEmpty>Type a name to create a food item.</ComboboxEmpty>
            <ComboboxList>
              {(item: FoodItemOption) => (
                <ComboboxItem key={`${item.type}-${item.id}`} value={item}>
                  {item.type === "existing" ? (
                    <span className="flex w-full justify-between gap-2">
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.calories ?? 0} kcal
                      </span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PlusIcon />
                      Create &ldquo;{item.name}&rdquo;
                    </span>
                  )}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {selected?.type === "new" && (
          <div className="flex flex-1 flex-col gap-2">
            <Label htmlFor="calories">Calories (per serving)</Label>
            <Input
              id="calories"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={calories}
              onChange={(inputEvent) => setCalories(inputEvent.target.value)}
              placeholder="e.g. 105"
              disabled={isPending}
              required
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="quantity">Quantity (servings)</Label>
          <Input
            id="quantity"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            value={quantity}
            onChange={(inputEvent) => setQuantity(inputEvent.target.value)}
            disabled={isPending}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={isPending} className="w-full sm:w-fit">
        <PlusIcon />
        {isPending ? "Adding..." : "Add food item"}
      </Button>
    </form>
  );
}
