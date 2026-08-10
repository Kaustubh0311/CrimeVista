from fastapi import APIRouter
from sqlalchemy.orm import Session

from backend.app.database.connection import SessionLocal
from backend.app.models.crime import CrimeRecord


router = APIRouter(
    prefix="/crimes",
    tags=["Crimes"]
)


@router.get("/")
def get_crimes():

    db: Session = SessionLocal()

    crimes = (
        db.query(CrimeRecord)
        .limit(100)
        .all()
    )

    result = []

    for crime in crimes:

        result.append({
            "id": crime.id,
            "crime_id": crime.crime_id,
            "crime_type": crime.crime_type,
            "crime_date": crime.crime_date,
            "crime_time": crime.crime_time,
            "location": crime.location,
            "city": crime.city,
            "state": crime.state,
            "latitude": crime.latitude,
            "longitude": crime.longitude,
            "description": crime.description
        })


    db.close()

    return {
        "count": len(result),
        "data": result
    }