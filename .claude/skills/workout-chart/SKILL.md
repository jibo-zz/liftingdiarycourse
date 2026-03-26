---
name: workout-chart
description: Generates a bar chart of workouts per month for the past 12 months by querying the PostgreSQL database. Use this skill whenever the user asks to visualize, chart, plot, or graph their workout history, frequency, or activity — even if they don't say "chart" explicitly (e.g. "show me how often I've been working out", "how many workouts did I do this year", "generate a workout summary image"). Reads DATABASE_URL from .env, queries the workouts table, and exports workout_chart.png to the current directory.
---

# Workout Chart Skill

Generate a bar chart showing workout frequency per month over the past 12 months.

## Steps

1. **Read DATABASE_URL from .env**

   Parse the `.env` file in the current working directory to extract the `DATABASE_URL` value. Look for a line matching `DATABASE_URL=...`. Strip surrounding quotes if present.

   If no `.env` file exists or `DATABASE_URL` is not found, tell the user and stop.

2. **Run the bundled Python script**

   The plotting script is at `scripts/plot_workouts.py` relative to this skill's directory. Run it with:

   ```bash
   python <skill-dir>/scripts/plot_workouts.py "<DATABASE_URL>" "<output_path>"
   ```

   - `<skill-dir>` — the directory containing this SKILL.md file
   - `<DATABASE_URL>` — the value parsed from `.env`
   - `<output_path>` — `workout_chart.png` in the user's current working directory (use an absolute path)

   The script handles installing missing Python packages (`psycopg2-binary`, `matplotlib`) automatically via pip. If pip itself is unavailable, inform the user they need Python + pip installed.

3. **Report the result**

   Tell the user the chart was saved and give the full absolute path to `workout_chart.png`. If the script printed any errors, surface them clearly so the user can act on them (e.g. wrong credentials, no data found).

## Notes

- The script uses a non-interactive matplotlib backend (`Agg`) so it works without a display.
- If there are no workouts in the past 12 months, the script will say so and exit without creating a file — let the user know.
- Do not hardcode any database credentials. Always read them from `.env` at runtime.
