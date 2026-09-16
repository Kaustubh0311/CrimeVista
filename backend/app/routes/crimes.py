from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.auth.dependencies import (
    get_db,
    get_current_user
)

from backend.app.models.crime import CrimeRecord
from backend.app.models.user import User


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/crimes",
    tags=["Crimes"]
)


# =========================================================
# GET ALL CRIMES
# =========================================================

@router.get("/")
def get_crimes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    crimes = (
        db.query(CrimeRecord)
        .order_by(CrimeRecord.id.desc())
        .all()
    )

    return [
        {
            "id": crime.id,
            "crime_type": crime.crime_type,
            "location": crime.location,
            "latitude": crime.latitude,
            "longitude": crime.longitude,
            "crime_date": crime.crime_date,
            "description": crime.description
        }
        for crime in crimes
    ]


# =========================================================
# GET CRIME LOCATIONS
# =========================================================

@router.get("/locations")
def get_crime_locations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    results = (
        db.query(CrimeRecord.location)
        .filter(
            CrimeRecord.location.isnot(None)
        )
        .distinct()
        .order_by(
            CrimeRecord.location
        )
        .all()
    )

    locations = [
        location[0]
        for location in results
        if location[0]
    ]

    return {
        "locations": locations
    }


# =========================================================
# GET CRIME BY ID
# =========================================================

@router.get("/{crime_id}")
def get_crime(
    crime_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    crime = (
        db.query(CrimeRecord)
        .filter(
            CrimeRecord.id == crime_id
        )
        .first()
    )

    if crime is None:
        return {
            "message": "Crime record not found"
        }

    return {
        "id": crime.id,
        "crime_type": crime.crime_type,
        "location": crime.location,
        "latitude": crime.latitude,
        "longitude": crime.longitude,
        "crime_date": crime.crime_date,
        "description": crime.description
    }