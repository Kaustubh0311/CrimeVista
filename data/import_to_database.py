import sys
import os

import pandas as pd

# Add project root to Python path
PROJECT_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

sys.path.insert(0, PROJECT_ROOT)


from sqlalchemy.orm import Session

from backend.app.database.connection import SessionLocal
from backend.app.models.crime import CrimeRecord


FILE_PATH = os.path.join(
    PROJECT_ROOT,
    "data",
    "processed_crime_data.csv"
)


# ------------------------------------------------
# Check dataset
# ------------------------------------------------

if not os.path.exists(FILE_PATH):

    print("ERROR: Processed dataset not found.")

    print(
        f"Expected file: {FILE_PATH}"
    )

    sys.exit(1)


# ------------------------------------------------
# Read dataset
# ------------------------------------------------

df = pd.read_csv(FILE_PATH)


print("\n========== DATABASE IMPORT ==========\n")

print(
    "Records found:",
    len(df)
)


print(
    "Columns found:"
)

print(
    list(df.columns)
)


# ------------------------------------------------
# Replace NaN with None
# ------------------------------------------------

df = df.where(
    pd.notnull(df),
    None
)


# ------------------------------------------------
# Database connection
# ------------------------------------------------

db: Session = SessionLocal()


inserted = 0
skipped = 0


# ------------------------------------------------
# Import records
# ------------------------------------------------

for index, row in df.iterrows():

    try:

        crime = CrimeRecord(

            crime_id=(
                str(row["crime_id"])
                if "crime_id" in df.columns
                and row["crime_id"] is not None
                else None
            ),

            crime_type=(
                str(row["crime_type"])
                if "crime_type" in df.columns
                and row["crime_type"] is not None
                else None
            ),

            location=(
                str(row["location"])
                if "location" in df.columns
                and row["location"] is not None
                else None
            ),

            city=(
                str(row["city"])
                if "city" in df.columns
                and row["city"] is not None
                else None
            ),

            state=(
                str(row["state"])
                if "state" in df.columns
                and row["state"] is not None
                else None
            ),

            latitude=(
                float(row["latitude"])
                if "latitude" in df.columns
                and row["latitude"] is not None
                else None
            ),

            longitude=(
                float(row["longitude"])
                if "longitude" in df.columns
                and row["longitude"] is not None
                else None
            ),

            description=(
                str(row["description"])
                if "description" in df.columns
                and row["description"] is not None
                else None
            )
        )


        # ----------------------------------------
        # Crime date
        # ----------------------------------------

        if (
            "crime_date" in df.columns
            and row["crime_date"] is not None
        ):

            date_value = pd.to_datetime(
                row["crime_date"],
                errors="coerce"
            )

            if pd.notna(date_value):

                crime.crime_date = date_value.date()


        # ----------------------------------------
        # Crime time
        # ----------------------------------------

        if (
            "crime_time" in df.columns
            and row["crime_time"] is not None
        ):

            time_value = pd.to_datetime(
                row["crime_time"],
                errors="coerce"
            )

            if pd.notna(time_value):

                crime.crime_time = time_value.time()


        db.add(crime)

        inserted += 1


    except Exception as error:

        skipped += 1

        print(
            f"Skipped row {index}: {error}"
        )


# ------------------------------------------------
# Save records
# ------------------------------------------------

try:

    db.commit()

    print("\nDatabase commit successful.")

except Exception as error:

    db.rollback()

    print(
        "\nDatabase commit failed:"
    )

    print(error)

    db.close()

    sys.exit(1)


db.close()


# ------------------------------------------------
# Final result
# ------------------------------------------------

print("\n========== IMPORT COMPLETED ==========\n")

print(
    "Inserted:",
    inserted
)

print(
    "Skipped:",
    skipped
)

print(
    "\nCrime data import finished successfully."
)