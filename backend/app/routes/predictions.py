from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import traceback

from backend.app.auth.dependencies import get_db, get_current_user
from backend.app.models.user import User
from backend.app.services.prediction import predict_next_day


router = APIRouter(
    prefix="/predictions",
    tags=["Crime Prediction"]
)


@router.get("/next-day")
def predict_area_next_day(
    location: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    try:

        result = predict_next_day(
            db=db,
            location=location
        )

        return result

    except ValueError as error:

        print("\n========== PREDICTION VALUE ERROR ==========")
        print("Error:", repr(error))
        print("============================================\n")

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except FileNotFoundError as error:

        print("\n========== PREDICTION FILE ERROR ==========")
        print("Error:", repr(error))
        print("===========================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )

    except Exception as error:

        print("\n========== PREDICTION ERROR ==========")
        print("Error type:", type(error).__name__)
        print("Error:", repr(error))
        print("\nFull traceback:")
        traceback.print_exc()
        print("======================================\n")

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )