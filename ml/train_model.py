import os
import joblib
import pandas as pd

from sklearn.compose import (
    ColumnTransformer
)

from sklearn.pipeline import Pipeline

from sklearn.preprocessing import (
    OneHotEncoder
)

from sklearn.ensemble import (
    RandomForestRegressor
)

from sklearn.metrics import (
    mean_absolute_error,
    mean_squared_error,
    r2_score
)


DATA_FILE = (
    "ml/data/training_data.csv"
)

MODEL_FILE = (
    "ml/models/crime_risk_model.joblib"
)


FEATURES = [

    "location",

    "month",

    "day",

    "day_of_week",

    "is_weekend",

    "lag_1",

    "lag_7",

    "rolling_7",

    "rolling_30"
]


TARGET = "target_next_day"


def train_model():

    # ----------------------------------
    # Load data
    # ----------------------------------

    df = pd.read_csv(
        DATA_FILE
    )


    df["date"] = pd.to_datetime(
        df["date"]
    )


    df = df.sort_values(
        "date"
    )


    print(
        "Training records:",
        len(df)
    )


    # ----------------------------------
    # Chronological train/test split
    #
    # DO NOT random shuffle
    # ----------------------------------

    split_index = int(
        len(df) * 0.80
    )


    train_df = (
        df.iloc[
            :split_index
        ]
    )


    test_df = (
        df.iloc[
            split_index:
        ]
    )


    print(
        "Training rows:",
        len(train_df)
    )

    print(
        "Testing rows:",
        len(test_df)
    )


    X_train = (
        train_df[
            FEATURES
        ]
    )

    y_train = (
        train_df[
            TARGET
        ]
    )


    X_test = (
        test_df[
            FEATURES
        ]
    )

    y_test = (
        test_df[
            TARGET
        ]
    )


    # ----------------------------------
    # Column types
    # ----------------------------------

    categorical_features = [
        "location"
    ]


    numeric_features = [

        "month",

        "day",

        "day_of_week",

        "is_weekend",

        "lag_1",

        "lag_7",

        "rolling_7",

        "rolling_30"

    ]


    # ----------------------------------
    # Preprocessing
    # ----------------------------------

    preprocessor = (

        ColumnTransformer(

            transformers=[

                (
                    "location",

                    OneHotEncoder(
                        handle_unknown="ignore"
                    ),

                    categorical_features
                ),

                (
                    "numbers",

                    "passthrough",

                    numeric_features
                )

            ]

        )

    )


    # ----------------------------------
    # Random Forest Model
    # ----------------------------------

    model = (

        RandomForestRegressor(

            n_estimators=300,

            max_depth=12,

            min_samples_leaf=2,

            random_state=42,

            n_jobs=-1

        )

    )


    # ----------------------------------
    # Pipeline
    # ----------------------------------

    pipeline = Pipeline(

        steps=[

            (
                "preprocessor",
                preprocessor
            ),

            (
                "model",
                model
            )

        ]

    )


    print(
        "\nTraining model..."
    )


    pipeline.fit(
        X_train,
        y_train
    )


    # ----------------------------------
    # Predictions
    # ----------------------------------

    predictions = pipeline.predict(
        X_test
    )


    predictions = predictions.clip(
        min=0
    )


    # ----------------------------------
    # Evaluation
    # ----------------------------------

    mae = mean_absolute_error(
        y_test,
        predictions
    )


    mse = mean_squared_error(
        y_test,
        predictions
    )


    rmse = mse ** 0.5


    r2 = r2_score(
        y_test,
        predictions
    )


    print(
        "\n=============================="
    )

    print(
        "MODEL EVALUATION"
    )

    print(
        "=============================="
    )

    print(
        f"MAE  : {mae:.3f}"
    )

    print(
        f"RMSE : {rmse:.3f}"
    )

    print(
        f"R²   : {r2:.3f}"
    )


    # ----------------------------------
    # Baseline
    #
    # Predict tomorrow =
    # today's crime count
    # ----------------------------------

    baseline_predictions = (
        X_test["lag_1"]
    )


    baseline_mae = (
        mean_absolute_error(
            y_test,
            baseline_predictions
        )
    )


    print(
        f"Baseline MAE: "
        f"{baseline_mae:.3f}"
    )


    if mae < baseline_mae:

        print(
            "Model beats baseline."
        )

    else:

        print(
            "WARNING: Model does not "
            "beat baseline."
        )


    # ----------------------------------
    # Save model
    # ----------------------------------

    os.makedirs(
        "ml/models",
        exist_ok=True
    )


    model_package = {

        "model":
            pipeline,

        "features":
            FEATURES,

        "mae":
            mae,

        "rmse":
            rmse,

        "r2":
            r2,

        "baseline_mae":
            baseline_mae

    }


    joblib.dump(

        model_package,

        MODEL_FILE

    )


    print(
        "\nModel saved:"
    )

    print(
        MODEL_FILE
    )


if __name__ == "__main__":

    train_model()