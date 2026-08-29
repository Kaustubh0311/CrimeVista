from fastapi import APIRouter
from fastapi import Depends

from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.auth.dependencies import get_db
from backend.app.auth.dependencies import get_current_user

from backend.app.models.crime import CrimeRecord
from backend.app.models.user import User


router = APIRouter(
    prefix="/crimes",
    tags=["Crime Data"]
)


# =========================================================
# GET ALL CRIME RECORDS
# =========================================================

@router.get("/")
def get_crimes(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    crimes = (
        db.query(CrimeRecord)
        .order_by(
            CrimeRecord.id.desc()
        )
        .all()
    )


    return [

        {
            "id": crime.id,

            "crime_type":
                crime.crime_type,

            "location":
                crime.location,

            "latitude":
                crime.latitude,

            "longitude":
                crime.longitude,

            "crime_date":
                crime.crime_date,

            "description":
                crime.description

        }

        for crime in crimes

    ]


# =========================================================
# GET CRIME STATISTICS
# =========================================================

@router.get("/statistics")
def get_crime_statistics(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    # -----------------------------------------------------
    # TOTAL NUMBER OF CRIMES
    # -----------------------------------------------------

    total_crimes = (
        db.query(
            func.count(CrimeRecord.id)
        )
        .scalar()
    )


    # -----------------------------------------------------
    # TOTAL UNIQUE LOCATIONS
    # -----------------------------------------------------

    total_locations = (
        db.query(
            func.count(
                func.distinct(
                    CrimeRecord.location
                )
            )
        )
        .scalar()
    )


    # -----------------------------------------------------
    # CRIMES GROUPED BY CRIME TYPE
    # -----------------------------------------------------

    crime_type_results = (

        db.query(

            CrimeRecord.crime_type,

            func.count(
                CrimeRecord.id
            )

        )

        .group_by(
            CrimeRecord.crime_type
        )

        .order_by(
            func.count(
                CrimeRecord.id
            ).desc()
        )

        .all()

    )


    # -----------------------------------------------------
    # CRIMES GROUPED BY LOCATION
    # -----------------------------------------------------

    location_results = (

        db.query(

            CrimeRecord.location,

            func.count(
                CrimeRecord.id
            )

        )

        .group_by(
            CrimeRecord.location
        )

        .order_by(
            func.count(
                CrimeRecord.id
            ).desc()
        )

        .all()

    )


    # -----------------------------------------------------
    # RETURN STATISTICS
    # -----------------------------------------------------

    return {

        "total_crimes":
            total_crimes or 0,


        "total_locations":
            total_locations or 0,


        "crime_types": [

            {
                "name": crime_type,

                "count": count

            }

            for crime_type, count
            in crime_type_results

        ],


        "locations": [

            {
                "name": location,

                "count": count

            }

            for location, count
            in location_results

        ]

    }


# =========================================================
# PHASE 6
# GET ONLY NAGPUR CRIME RECORDS
# =========================================================

@router.get("/nagpur")
def get_nagpur_crimes(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    # -----------------------------------------------------
    # FETCH ONLY NAGPUR CRIME RECORDS
    # -----------------------------------------------------

    crimes = (

        db.query(CrimeRecord)

        .filter(
            CrimeRecord.location.ilike(
                "%Nagpur%"
            )
        )

        .order_by(
            CrimeRecord.id.desc()
        )

        .all()

    )


    # -----------------------------------------------------
    # RETURN NAGPUR CRIME DATA
    # -----------------------------------------------------

    return [

        {

            "id":
                crime.id,

            "crime_type":
                crime.crime_type,

            "location":
                crime.location,

            "latitude":
                crime.latitude,

            "longitude":
                crime.longitude,

            "crime_date":
                crime.crime_date,

            "description":
                crime.description

        }

        for crime in crimes

    ]