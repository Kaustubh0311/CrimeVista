import sys
from pathlib import Path

import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.app.database.connection import engine


OUTPUT_FILE = "ml/data/training_data.csv"


def load_crime_data():

    query = """
        SELECT
            id,
            crime_type,
            location,
            crime_date,
            latitude,
            longitude
        FROM crime_records
        WHERE crime_date IS NOT NULL
          AND location IS NOT NULL
    """

    df = pd.read_sql(
        query,
        engine
    )

    return df


def prepare_data():

    df = load_crime_data()

    print("\n==============================")
    print("RAW CRIME DATA")
    print("==============================")

    print("Records:", len(df))


    if df.empty:

        raise ValueError(
            "No crime records found in database."
        )


    # ----------------------------------
    # Convert date
    # ----------------------------------

    df["crime_date"] = pd.to_datetime(
        df["crime_date"],
        errors="coerce"
    )


    df = df.dropna(
        subset=[
            "crime_date",
            "location"
        ]
    )


    # ----------------------------------
    # Clean location
    # ----------------------------------

    df["location"] = (
        df["location"]
        .astype(str)
        .str.strip()
        .str.title()
    )


    # ----------------------------------
    # Create DATE ONLY column
    # ----------------------------------

    df["date"] = (
        df["crime_date"]
        .dt.date
    )


    # ----------------------------------
    # Aggregate crimes by area + date
    # ----------------------------------

    daily = (
        df.groupby(
            [
                "location",
                "date"
            ]
        )
        .size()
        .reset_index(
            name="crime_count"
        )
    )


    daily["date"] = pd.to_datetime(
        daily["date"]
    )


    print(
        "Area-day records:",
        len(daily)
    )


    # ----------------------------------
    # Build complete date sequence
    # ----------------------------------

    all_dates = pd.date_range(
        start=daily["date"].min(),
        end=daily["date"].max(),
        freq="D"
    )


    locations = (
        daily["location"]
        .unique()
    )


    complete_index = (
        pd.MultiIndex
        .from_product(
            [
                locations,
                all_dates
            ],
            names=[
                "location",
                "date"
            ]
        )
    )


    complete = (
        daily
        .set_index(
            [
                "location",
                "date"
            ]
        )
        .reindex(
            complete_index,
            fill_value=0
        )
        .reset_index()
    )


    # ----------------------------------
    # Time features
    # ----------------------------------

    complete["year"] = (
        complete["date"].dt.year
    )

    complete["month"] = (
        complete["date"].dt.month
    )

    complete["day"] = (
        complete["date"].dt.day
    )

    complete["day_of_week"] = (
        complete["date"].dt.dayofweek
    )

    complete["is_weekend"] = (
        complete["day_of_week"]
        .isin([5, 6])
        .astype(int)
    )


    # ----------------------------------
    # Lag features
    # ----------------------------------

    complete = complete.sort_values(
        [
            "location",
            "date"
        ]
    )


    complete["lag_1"] = (
        complete
        .groupby("location")[
            "crime_count"
        ]
        .shift(1)
    )


    complete["lag_7"] = (
        complete
        .groupby("location")[
            "crime_count"
        ]
        .shift(7)
    )


    complete["rolling_7"] = (
        complete
        .groupby("location")[
            "crime_count"
        ]
        .transform(
            lambda series:
                series
                .shift(1)
                .rolling(7)
                .mean()
        )
    )


    complete["rolling_30"] = (
        complete
        .groupby("location")[
            "crime_count"
        ]
        .transform(
            lambda series:
                series
                .shift(1)
                .rolling(30)
                .mean()
        )
    )


    # ----------------------------------
    # TARGET
    #
    # Next day's crime count
    # ----------------------------------

    complete[
        "target_next_day"
    ] = (

        complete
        .groupby("location")[
            "crime_count"
        ]
        .shift(-1)

    )


    # ----------------------------------
    # Remove unavailable lag/target rows
    # ----------------------------------

    complete = complete.dropna(
        subset=[
            "lag_1",
            "lag_7",
            "rolling_7",
            "rolling_30",
            "target_next_day"
        ]
    )


    # ----------------------------------
    # Save
    # ----------------------------------

    complete.to_csv(
        OUTPUT_FILE,
        index=False
    )


    print("\n==============================")
    print("TRAINING DATA CREATED")
    print("==============================")

    print(
        "Rows:",
        len(complete)
    )

    print(
        "Locations:",
        complete[
            "location"
        ].nunique()
    )

    print(
        "Saved:",
        OUTPUT_FILE
    )


if __name__ == "__main__":

    prepare_data()