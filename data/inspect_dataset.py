import pandas as pd
import os


FILE_PATH = "data/crime_data.csv"


if not os.path.exists(FILE_PATH):
    print("ERROR: Crime dataset not found.")
    print(f"Expected location: {FILE_PATH}")
    exit()


df = pd.read_csv(FILE_PATH)


print("\n========== DATASET INFORMATION ==========\n")

print("Number of rows:", df.shape[0])
print("Number of columns:", df.shape[1])


print("\n========== COLUMN NAMES ==========\n")

for column in df.columns:
    print(column)


print("\n========== DATA TYPES ==========\n")

print(df.dtypes)


print("\n========== FIRST 5 RECORDS ==========\n")

print(df.head())


print("\n========== MISSING VALUES ==========\n")

print(df.isnull().sum())


print("\n========== DUPLICATE RECORDS ==========\n")

print("Duplicate rows:", df.duplicated().sum())


print("\n========== DATASET SUMMARY ==========\n")

print(df.describe(include="all").transpose())