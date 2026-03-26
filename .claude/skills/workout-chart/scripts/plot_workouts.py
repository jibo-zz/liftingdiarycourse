#!/usr/bin/env python3
"""
Query the workouts table and plot a bar chart of workouts per month over the past 12 months.
Usage: python plot_workouts.py <DATABASE_URL> [output_path]
"""

import sys
import os

def install_if_missing(package):
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

# Ensure required packages are available
try:
    import psycopg2
except ImportError:
    try:
        import psycopg as psycopg2
    except ImportError:
        print("Installing psycopg2-binary...")
        install_if_missing("psycopg2-binary")
        import psycopg2

try:
    import matplotlib
    matplotlib.use("Agg")  # Non-interactive backend (no display needed)
    import matplotlib.pyplot as plt
except ImportError:
    print("Installing matplotlib...")
    install_if_missing("matplotlib")
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

def main():
    if len(sys.argv) < 2:
        print("Usage: python plot_workouts.py <DATABASE_URL> [output_path]")
        sys.exit(1)

    database_url = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "workout_chart.png"

    # Connect and query
    try:
        conn = psycopg2.connect(database_url)
    except Exception as e:
        print(f"Error connecting to database: {e}")
        sys.exit(1)

    query = """
        SELECT
          TO_CHAR(DATE_TRUNC('month', started_at), 'Mon YYYY') as month_label,
          DATE_TRUNC('month', started_at) as month_date,
          COUNT(*) as workout_count
        FROM workouts
        WHERE started_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', started_at), TO_CHAR(DATE_TRUNC('month', started_at), 'Mon YYYY')
        ORDER BY month_date ASC
    """

    try:
        cur = conn.cursor()
        cur.execute(query)
        rows = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error querying database: {e}")
        conn.close()
        sys.exit(1)

    if not rows:
        print("No workout data found for the past 12 months.")
        sys.exit(0)

    month_labels = [row[0] for row in rows]
    workout_counts = [int(row[2]) for row in rows]

    # Plot
    fig, ax = plt.subplots(figsize=(12, 6))
    bars = ax.bar(month_labels, workout_counts, color="#4A90D9", edgecolor="#2C5F8A", linewidth=0.8)

    # Add value labels on top of each bar
    for bar, count in zip(bars, workout_counts):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.1,
            str(count),
            ha="center",
            va="bottom",
            fontsize=11,
            fontweight="bold",
            color="#333333"
        )

    ax.set_title("Workouts Per Month (Past 12 Months)", fontsize=16, fontweight="bold", pad=15)
    ax.set_xlabel("Month", fontsize=13, labelpad=10)
    ax.set_ylabel("Number of Workouts", fontsize=13, labelpad=10)
    ax.set_ylim(0, max(workout_counts) * 1.2 + 1)
    ax.yaxis.set_major_locator(plt.MaxNLocator(integer=True))
    ax.tick_params(axis="x", rotation=30, labelsize=10)
    ax.tick_params(axis="y", labelsize=10)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.grid(axis="y", linestyle="--", alpha=0.4)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight")
    plt.close()

    print(f"Chart saved to: {os.path.abspath(output_path)}")

if __name__ == "__main__":
    main()
