import csv
import io

from datetime import datetime

from sqlalchemy.orm import Session

from backend.app.models.crime import CrimeRecord


REQUIRED_COLUMNS = {
    "crime_type",
    "location",
    "latitude",
    "longitude",
    "crime_date",
    "description"
}


def process_crime_csv(
    file_content: bytes,
    db: Session
):

    decoded_content = file_content.decode(
        "utf-8-sig"
    )

    csv_file = io.StringIO(
        decoded_content
    )

    reader = csv.DictReader(
        csv_file
    )

    if reader.fieldnames is None:

        raise ValueError(
            "CSV file does not contain headers"
        )


    csv_columns = {
        column.strip()
        for column in reader.fieldnames
    }


    missing_columns = (
        REQUIRED_COLUMNS - csv_columns
    )


    if missing_columns:

        raise ValueError(
            "Missing columns: "
            + ", ".join(
                sorted(missing_columns)
            )
        )


    inserted_count = 0

    skipped_count = 0

    errors = []


    for row_number, row in enumerate(
        reader,
        start=2
    ):

        try:

            # =========================================
            # READ CSV VALUES
            # =========================================

            crime_type = (
                row["crime_type"]
                .strip()
            )

            location = (
                row["location"]
                .strip()
            )

            description = (
                row["description"]
                .strip()
            )


            latitude = float(
                row["latitude"]
            )

            longitude = float(
                row["longitude"]
            )


            crime_date = datetime.strptime(
                row["crime_date"].strip(),
                "%Y-%m-%d"
            )


            # =========================================
            # BASIC VALIDATION
            # =========================================

            if not crime_type:

                raise ValueError(
                    "crime_type is empty"
                )


            if not location:

                raise ValueError(
                    "location is empty"
                )


            # =========================================
            # NAGPUR-ONLY VALIDATION
            # =========================================

            if "nagpur" not in location.lower():

                raise ValueError(
                    "Only Nagpur crime records "
                    "are allowed"
                )


            # =========================================
            # LATITUDE VALIDATION
            # =========================================

            if not (
                -90 <= latitude <= 90
            ):

                raise ValueError(
                    "Invalid latitude"
                )


            # =========================================
            # LONGITUDE VALIDATION
            # =========================================

            if not (
                -180 <= longitude <= 180
            ):

                raise ValueError(
                    "Invalid longitude"
                )


            # =========================================
            # CHECK DUPLICATE RECORD
            # =========================================

            existing_record = (
                db.query(CrimeRecord)
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


            # =========================================
            # CREATE CRIME RECORD
            # =========================================

            crime = CrimeRecord(

                crime_type=crime_type,

                location=location,

                latitude=latitude,

                longitude=longitude,

                crime_date=crime_date,

                description=description

            )


            db.add(crime)

            inserted_count += 1


        except Exception as error:

            errors.append({

                "row": row_number,

                "error": str(error)

            })


    # =============================================
    # SAVE DATA
    # =============================================

    db.commit()


    # =============================================
    # RETURN RESULT
    # =============================================

    return {

        "inserted": inserted_count,

        "skipped": skipped_count,

        "failed": len(errors),

        "errors": errors

    }