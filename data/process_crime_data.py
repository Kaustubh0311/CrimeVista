import pandas as pd
import os


INPUT_FILE = "data/crime_data.csv"
OUTPUT_FILE = "data/processed_crime_data.csv"


if not os.path.exists(INPUT_FILE):
    print("ERROR: Dataset not found.")
    exit()


df = pd.read_csv(INPUT_FILE)


print("Original rows:", len(df))


# ------------------------------------------------
# 1. Remove duplicate rows
# ------------------------------------------------

df = df.drop_duplicates()


print("Rows after removing duplicates:", len(df))


# ------------------------------------------------
# 2. Remove completely empty columns
# ------------------------------------------------

df = df.dropna(axis=1, how="all")


# ------------------------------------------------
# 3. Remove completely empty rows
# ------------------------------------------------

df = df.dropna(axis=0, how="all")


# ------------------------------------------------
# 4. Clean column names
# ------------------------------------------------

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)


# ------------------------------------------------
# 5. Remove leading/trailing spaces from text
# ------------------------------------------------

for column in df.select_dtypes(include="object").columns:
    df[column] = df[column].str.strip()


# ------------------------------------------------
# 6. Save processed dataset
# ------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)


print("\nProcessing completed.")
print("Final rows:", len(df))
print("Final columns:", len(df.columns))
print("Saved to:", OUTPUT_FILE)
required_columns = [
    "crime_type"
]


for column in required_columns:

    if column not in df.columns:

        print(
            f"ERROR: Required column '{column}' is missing."
        )

        exit()


print("Required columns are available.")