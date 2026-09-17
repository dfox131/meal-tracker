import { getMealsForCurrentUserByDate } from "@/data/meals";
import { DashboardView } from "./dashboard-view";

function parseDateParam(dateParam: string | undefined) {
  if (dateParam) {
    const parsed = new Date(`${dateParam}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const dateParam = Array.isArray(searchParams.date)
    ? searchParams.date[0]
    : searchParams.date;

  const date = parseDateParam(dateParam);
  const meals = await getMealsForCurrentUserByDate(date);
  const mealCreated = searchParams.created === "1";

  return <DashboardView meals={meals} date={date} mealCreated={mealCreated} />;
}
