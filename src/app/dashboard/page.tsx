import { getMealsForCurrentUserByDate } from "@/data/meals";
import { formatDateParamInTimeZone, parseDateParam } from "@/lib/dates";
import { getUserTimeZone } from "@/lib/timezone";
import { DashboardView } from "./dashboard-view";

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const rawDateParam = Array.isArray(searchParams.date)
    ? searchParams.date[0]
    : searchParams.date;

  // Calendar days are the user's, never the server's: see src/lib/dates.ts.
  const timeZone = await getUserTimeZone();
  const dateParam =
    rawDateParam && parseDateParam(rawDateParam)
      ? rawDateParam
      : formatDateParamInTimeZone(new Date(), timeZone);

  const meals = await getMealsForCurrentUserByDate(dateParam, timeZone);
  const mealCreated = searchParams.created === "1";

  return (
    <DashboardView
      meals={meals}
      dateParam={dateParam}
      timeZone={timeZone}
      mealCreated={mealCreated}
    />
  );
}
