"""Render daily calorie totals (from fetch_daily_calories.ts) as a PNG bar chart.

Usage:
    python plot_calories.py <daily.json> --out <chart.png>
"""

import argparse
import json
from datetime import date

import matplotlib

matplotlib.use("Agg")  # headless: write files, never open a window
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib.ticker import FuncFormatter, MaxNLocator  # noqa: E402

# Light-theme tokens from the dataviz reference palette.
SURFACE = "#fcfcfb"
TEXT_PRIMARY = "#0b0b0b"
TEXT_SECONDARY = "#52514e"
GRID = "#e4e3df"
BAR = "#2a78d6"


def short_date(iso: str) -> str:
    return date.fromisoformat(iso).strftime("%b %-d")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("data", help="JSON written by fetch_daily_calories.ts")
    parser.add_argument("--out", required=True, help="PNG path to write")
    args = parser.parse_args()

    with open(args.data) as f:
        data = json.load(f)
    days = data["days"]
    if not days:
        raise SystemExit("error: no days in input")

    labels = [
        f"{date.fromisoformat(d['date']).strftime('%a')}\n{short_date(d['date'])}"
        for d in days
    ]
    calories = [d["calories"] for d in days]
    positions = range(len(days))

    fig, ax = plt.subplots(figsize=(9, 5), dpi=150)
    fig.patch.set_facecolor(SURFACE)
    ax.set_facecolor(SURFACE)

    bars = ax.bar(positions, calories, width=0.45, color=BAR, zorder=2)

    peak = max(calories) or 1
    ax.set_ylim(0, peak * 1.15)
    for bar, value in zip(bars, calories):
        ax.annotate(
            f"{value:,}",
            xy=(bar.get_x() + bar.get_width() / 2, bar.get_height()),
            xytext=(0, 4),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=9,
            color=TEXT_PRIMARY,
        )

    ax.set_xticks(list(positions), labels, fontsize=9, color=TEXT_SECONDARY)
    ax.set_xlabel("Date", fontsize=10, color=TEXT_SECONDARY, labelpad=8)
    ax.set_ylabel("Calories (kcal)", fontsize=10, color=TEXT_SECONDARY, labelpad=8)
    ax.yaxis.set_major_locator(MaxNLocator(nbins=5, integer=True))
    ax.yaxis.set_major_formatter(FuncFormatter(lambda v, _: f"{int(v):,}"))
    ax.tick_params(axis="y", colors=TEXT_SECONDARY, labelsize=9, length=0)
    ax.tick_params(axis="x", length=0)
    ax.grid(axis="y", color=GRID, linewidth=0.8, zorder=0)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color(TEXT_SECONDARY)

    start, end = days[0]["date"], days[-1]["date"]
    total = sum(calories)
    # Fixed margins so the title block lines up with the plot's left edge.
    left = 0.1
    fig.subplots_adjust(left=left, right=0.98, top=0.82, bottom=0.17)
    fig.text(
        left, 0.94,
        f"Daily calories, {short_date(start)} – {short_date(end)}, {end[:4]}",
        ha="left", fontsize=13, color=TEXT_PRIMARY, fontweight="bold",
    )
    fig.text(
        left, 0.885,
        f"{total:,} kcal total · avg {round(total / len(days)):,}/day · "
        f"timezone {data.get('timeZone', 'unknown')}",
        ha="left", fontsize=9, color=TEXT_SECONDARY,
    )

    fig.savefig(args.out, facecolor=SURFACE)
    print(args.out)


if __name__ == "__main__":
    main()
