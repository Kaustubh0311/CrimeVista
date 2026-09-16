import csv
import io

from datetime import datetime

from sqlalchemy.orm import Session

from backend.app.models.crime import CrimeRecord


# =========================================================
# REQUIRED CSV COLUMNS
# =========================================================

REQUIRED_COLUMNS = {
    "crime_type",
    "location",
    "latitude",
    "longitude",
    "crime_date"
}


# =========================================================
# NAGPUR GEOGRAPHIC BOUNDARY
# =========================================================
# Approximate Nagpur city boundary.
# Records outside this area will not be uploaded.

NAGPUR_LAT_MIN = 20.95
NAGPUR_LAT_MAX = 21.35

NAGPUR_LON_MIN = 78.85
NAGPUR_LON_MAX = 79.35


# =========================================================
# DATE PARSER
# =========================================================

def parse_crime_date(date_value):

    if date_value is None:
        raise ValueError(
            "crime_date is missing"
        )

    date_value = str(
        date_value
    ).strip()

    if not date_value:
        raise ValueError(
            "crime_date is empty"
        )

    supported_formats = [

        "%Y-%m-%d",

        "%d-%m-%Y",

        "%d/%m/%Y",

        "%Y/%m/%d",

        "%m/%d/%Y",

        "%d-%b-%Y",

        "%d-%B-%Y"

    ]

    for date_format in supported_formats:

        try:

            return datetime.strptime(
                date_value,
                date_format
            )

        except ValueError:

            continue


    raise ValueError(
        f"Invalid crime_date format: {date_value}"
    )


# =========================================================
# PROCESS CRIME CSV
# =========================================================

def process_crime_csv(
    file_content: bytes,
    db: Session
):

    # =====================================================
    # DECODE CSV
    # =====================================================

    try:

        decoded_content = file_content.decode(
            "utf-8-sig"
        )

    except UnicodeDecodeError:

        raise ValueError(
            "CSV file must be UTF-8 encoded"
        )


    csv_file = io.StringIO(
        decoded_content
    )


    # =====================================================
    # READ CSV
    # =====================================================

    reader = csv.DictReader(
        csv_file
    )


    if reader.fieldnames is None:

        raise ValueError(
            "CSV file does not contain headers"
        )


    # =====================================================
    # CLEAN COLUMN NAMES
    # =====================================================

    reader.fieldnames = [

        column.strip().lower()

        if column

        else column

        for column in reader.fieldnames

    ]


    csv_columns = {

        column.strip().lower()

        for column in reader.fieldnames

        if column

    }


    # =====================================================
    # CHECK REQUIRED COLUMNS
    # =====================================================

    missing_columns = (

        REQUIRED_COLUMNS
        - csv_columns

    )


    if missing_columns:

        raise ValueError(

            "Missing columns: "
            + ", ".join(
                sorted(missing_columns)
            )

        )


    # =====================================================
    # COUNTERS
    # =====================================================

    inserted_count = 0

    skipped_count = 0

    errors = []


    # =====================================================
    # PROCESS EACH ROW
    # =====================================================

    for row_number, row in enumerate(
        reader,
        start=2
    ):

        try:

            # =============================================
            # CLEAN ROW KEYS
            # =============================================

            row = {

                key.strip().lower(): value

                for key, value in row.items()

                if key is not None

            }


            # =============================================
            # CRIME TYPE
            # =============================================

            crime_type = str(

                row.get(
                    "crime_type",
                    ""
                )

            ).strip()


            if not crime_type:

                raise ValueError(
                    "crime_type is empty"
                )


            # =============================================
            # LOCATION
            # =============================================

            location = str(

                row.get(
                    "location",
                    ""
                )

            ).strip()


            if not location:

                raise ValueError(
                    "location is empty"
                )


            # =============================================
            # DESCRIPTION
            # =============================================
            # OPTIONAL FIELD
            #
            # If CSV does not contain description,
            # an empty description is stored.

            description = str(

                row.get(
                    "description",
                    ""
                )

            ).strip()


            # =============================================
            # LATITUDE
            # =============================================

            latitude_value = str(

                row.get(
                    "latitude",
                    ""
                )

            ).strip()


            if not latitude_value:

                raise ValueError(
                    "latitude is empty"
                )


            latitude = float(
                latitude_value
            )


            # =============================================
            # LONGITUDE
            # =============================================

            longitude_value = str(

                row.get(
                    "longitude",
                    ""
                )

            ).strip()


            if not longitude_value:

                raise ValueError(
                    "longitude is empty"
                )


            longitude = float(
                longitude_value
            )


            # =============================================
            # BASIC COORDINATE VALIDATION
            # =============================================

            if not (
                -90 <= latitude <= 90
            ):

                raise ValueError(
                    "Invalid latitude"
                )


            if not (
                -180 <= longitude <= 180
            ):

                raise ValueError(
                    "Invalid longitude"
                )


            # =============================================
            # NAGPUR-ONLY VALIDATION
            # =============================================
            # We use coordinates instead of checking
            # whether the word "Nagpur" exists in location.

            if not (

                NAGPUR_LAT_MIN
                <= latitude
                <= NAGPUR_LAT_MAX

                and

                NAGPUR_LON_MIN
                <= longitude
                <= NAGPUR_LON_MAX

            ):

                raise ValueError(
                    "Crime location is outside Nagpur"
                )


            # =============================================
            # CRIME DATE
            # =============================================

            crime_date = parse_crime_date(

                row.get(
                    "crime_date"
                )

            )


            # =============================================
            # CHECK DUPLICATE RECORD
            # =============================================

            existing_record = (

                db.query(
                    CrimeRecord
                )

                .filter(

                    CrimeRecord.crime_type
                    == crime_type,

                    CrimeRecord.location
                    == location,

                    CrimeRecord.latitude
                    == latitude,

                    CrimeRecord.longitude
                    == longitude,

                    CrimeRecord.crime_date
                    == crime_date

                )

                .first()

            )


            if existing_record:

                skipped_count += 1

                continue


            # =============================================
            # CREATE CRIME RECORD
            # =============================================

            crime = CrimeRecord(

                crime_type=crime_type,

                location=location,

                latitude=latitude,

                longitude=longitude,

                crime_date=crime_date,

                description=description

            )


            db.add(
                crime
            )

            inserted_count += 1


        # =============================================
        # HANDLE INDIVIDUAL ROW ERROR
        # =============================================

        except Exception as error:

            errors.append({

                "row": row_number,

                "error": str(error)

            })


    # =====================================================
    # SAVE DATABASE CHANGES
    # =====================================================

    db.commit()


    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {

        "inserted":
            inserted_count,

        "skipped":
            skipped_count,

        "failed":
            len(errors),

        "errors":
            errors

    }