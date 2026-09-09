from pathlib import Path

import joblib
import pandas as pd

from sqlalchemy.orm import Session

from backend.app.models.crime import (
    CrimeRecord
)


MODEL_PATH = Path(
    "ml/models/crime_risk_model.joblib"
)


_model_package = None


def load_model():

    global _model_package

    if _model_package is None:

        if not MODEL_PATH.exists():

            raise FileNotFoundError(
                "ML model not found. "
                "Run ml/train_model.py first."
            )

        _model_package = (
            joblib.load(
                MODEL_PATH
            )
        )

    return _model_package


def get_location_history(
    db: Session,
    location: str
):

    crimes = (

        db.query(
            CrimeRecord
        )

        .filter(
            CrimeRecord.location
            == location
        )

        .filter(
            CrimeRecord.crime_date
            .isnot(None)
        )

        .order_by(
            CrimeRecord.crime_date
        )

        .all()

    )


    if not crimes:

        raise ValueError(
            "No historical data "
            "available for this location."
        )


    data = [

        {
            "crime_date":
                crime.crime_date
        }

        for crime in crimes

    ]


    df = pd.DataFrame(
        data
    )


    df["crime_date"] = (
        pd.to_datetime(
            df["crime_date"]
        )
    )


    df["date"] = (
        df["crime_date"]
        .dt.normalize()
    )


    daily = (

        df.groupby(
            "date"
        )

        .size()

        .reset_index(
            name="crime_count"
        )

    )


    full_dates = pd.DataFrame({

        "date":
            pd.date_range(
                start=daily[
                    "date"
                ].min(),

                end=daily[
                    "date"
                ].max(),

                freq="D"
            )

    })


    daily = (

        full_dates

        .merge(
            daily,
            on="date",
            how="left"
        )

        .fillna({
            "crime_count": 0
        })

    )


    return daily


def calculate_risk_level(
    predicted_count: float,
    historical_average: float
):

    if historical_average <= 0:

        historical_average = 1


    ratio = (
        predicted_count
        /
        historical_average
    )


    if ratio < 0.8:

        return "LOW"


    if ratio < 1.3:

        return "MEDIUM"


    return "HIGH"


def predict_next_day(
    db: Session,
    location: str
):

    model_package = (
        load_model()
    )

    model = (
        model_package[
            "model"
        ]
    )


    history = (
        get_location_history(
            db,
            location
        )
    )


    if len(history) < 31:

        raise ValueError(
            "At least 31 days of "
            "historical data are required."
        )


    history = (
        history.sort_values(
            "date"
        )
    )


    last_date = (
        history[
            "date"
        ].max()
    )


    prediction_date = (
        last_date
        + pd.Timedelta(
            days=1
        )
    )


    lag_1 = float(
        history[
            "crime_count"
        ].iloc[-1]
    )


    lag_7 = float(
        history[
            "crime_count"
        ].iloc[-7]
    )


    rolling_7 = float(

        history[
            "crime_count"
        ]

        .tail(7)

        .mean()

    )


    rolling_30 = float(

        history[
            "crime_count"
        ]

        .tail(30)

        .mean()

    )


    features = pd.DataFrame([{

        "location":
            location,

        "month":
            prediction_date.month,

        "day":
            prediction_date.day,

        "day_of_week":
            prediction_date.dayofweek,

        "is_weekend":
            int(
                prediction_date
                .dayofweek
                in [5, 6]
            ),

        "lag_1":
            lag_1,

        "lag_7":
            lag_7,

        "rolling_7":
            rolling_7,

        "rolling_30":
            rolling_30

    }])


    predicted_count = float(

        model.predict(
            features
        )[0]

    )


    predicted_count = max(
        0,
        predicted_count
    )


    historical_average = float(

        history[
            "crime_count"
        ]
        .tail(30)
        .mean()

    )


    risk_level = (

        calculate_risk_level(

            predicted_count,

            historical_average

        )

    )


    return {

        "location":
            location,

        "prediction_date":
            prediction_date
            .date()
            .isoformat(),

        "predicted_crime_count":
            round(
                predicted_count,
                2
            ),

        "recent_30_day_average":
            round(
                historical_average,
                2
            ),

        "risk_level":
            risk_level

    }
from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from backend.app.auth.dependencies import (
    get_db,
    get_current_user
)

from backend.app.models.user import User

from backend.app.services.prediction import (
    predict_next_day
)


router = APIRouter(
    prefix="/predictions",
    tags=["Crime Prediction"]
)


@router.get("/next-day")
def predict_area_next_day(

    location: str,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    try:

        result = predict_next_day(
            db=db,
            location=location
        )

        return result


    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


    except FileNotFoundError as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


    except Exception as error:

        print(
            "Prediction error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Prediction could "
                "not be generated."
            )
        )