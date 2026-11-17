import pandas as pd


def prepare_crime_data(crimes):
    """
    Convert CrimeVista crime records into a clean DataFrame.
    """

    if not crimes:
        return pd.DataFrame()

    df = pd.DataFrame(crimes)

    # Make sure expected columns exist
    expected_columns = [
        "id",
        "crime_type",
        "location",
        "latitude",
        "longitude",
        "crime_date",
        "description",
    ]

    for column in expected_columns:
        if column not in df.columns:
            df[column] = None

    # Clean text fields
    df["crime_type"] = (
        df["crime_type"]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
    )

    df["location"] = (
        df["location"]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
    )

    # Convert dates
    df["crime_date"] = pd.to_datetime(
        df["crime_date"],
        errors="coerce"
    )

    return df


def answer_question(question, crimes):
    """
    Answer questions using the existing CrimeVista crime data.
    """

    df = prepare_crime_data(crimes)

    if df.empty:
        return (
            "I could not find any crime records in the CrimeVista "
            "database to answer this question."
        )

    question = question.lower().strip()

    total_crimes = len(df)

    # ---------------------------------------------------------
    # TOTAL CRIMES
    # ---------------------------------------------------------

    if (
        "how many crimes" in question
        or "total crimes" in question
        or "number of crimes" in question
        or "total crime" in question
    ):
        return (
            f"CrimeVista currently has **{total_crimes} recorded "
            f"crime incidents** in the available dataset."
        )

    # ---------------------------------------------------------
    # MOST COMMON CRIME
    # ---------------------------------------------------------

    if (
        "most common crime" in question
        or "common crime type" in question
        or "most frequent crime" in question
        or "which crime is common" in question
    ):
        counts = df["crime_type"].value_counts()

        if not counts.empty:
            crime = counts.index[0]
            count = int(counts.iloc[0])

            return (
                f"The most frequently recorded crime type is "
                f"**{crime}**, with **{count} incidents**."
            )

    # ---------------------------------------------------------
    # AREA WITH MOST CRIMES
    # ---------------------------------------------------------

    if (
        "which area" in question
        or "most crime area" in question
        or "highest crime area" in question
        or "area has the most" in question
        or "most crimes" in question
    ):
        area_counts = (
            df[df["location"] != "Unknown"]["location"]
            .value_counts()
        )

        if not area_counts.empty:
            area = area_counts.index[0]
            count = int(area_counts.iloc[0])

            return (
                f"**{area}** has the highest number of recorded "
                f"incidents in the available data, with **{count} incidents**."
            )

    # ---------------------------------------------------------
    # CRIME BY AREA
    # ---------------------------------------------------------

    for _, row in df.iterrows():

        location = str(row["location"]).lower()

        if (
            location != "unknown"
            and location in question
        ):
            area_df = df[
                df["location"].str.lower() == location
            ]

            count = len(area_df)

            crime_counts = area_df["crime_type"].value_counts()

            if not crime_counts.empty:
                common_crime = crime_counts.index[0]
            else:
                common_crime = "Unknown"

            return (
                f"For **{row['location']}**, CrimeVista has "
                f"**{count} recorded incidents** in the available data. "
                f"The most frequently recorded crime type there is "
                f"**{common_crime}**."
            )

    # ---------------------------------------------------------
    # CRIME TYPE INFORMATION
    # ---------------------------------------------------------

    crime_types = df["crime_type"].dropna().unique()

    for crime_type in crime_types:

        crime_name = str(crime_type).lower()

        if crime_name in question:

            count = int(
                (df["crime_type"].str.lower() == crime_name).sum()
            )

            areas = (
                df[
                    df["crime_type"].str.lower() == crime_name
                ]["location"]
                .value_counts()
            )

            if not areas.empty:
                top_area = areas.index[0]

                return (
                    f"CrimeVista has **{count} recorded incidents** "
                    f"of **{crime_type}**. The area with the most "
                    f"recorded incidents of this type is "
                    f"**{top_area}**."
                )

            return (
                f"CrimeVista has **{count} recorded incidents** "
                f"of **{crime_type}**."
            )

    # ---------------------------------------------------------
    # RECENT CRIMES
    # ---------------------------------------------------------

    if (
        "recent crime" in question
        or "latest crime" in question
        or "recent incidents" in question
        or "latest incidents" in question
    ):
        dated = df.dropna(subset=["crime_date"])

        if not dated.empty:

            latest_date = dated["crime_date"].max()

            recent = dated[
                dated["crime_date"] == latest_date
            ]

            return (
                f"The latest recorded crime date in the available "
                f"dataset is **{latest_date.strftime('%d %B %Y')}**, "
                f"with **{len(recent)} incident(s)** recorded on that date."
            )

    # ---------------------------------------------------------
    # CRIME TYPES
    # ---------------------------------------------------------

    if (
        "crime types" in question
        or "types of crime" in question
        or "what crimes" in question
        or "list crimes" in question
    ):
        counts = df["crime_type"].value_counts()

        result = []

        for crime, count in counts.items():
            result.append(f"- {crime}: {count}")

        return (
            "The available CrimeVista dataset contains these "
            "recorded crime types:\n\n"
            + "\n".join(result)
        )

    # ---------------------------------------------------------
    # AREAS
    # ---------------------------------------------------------

    if (
        "areas" in question
        or "locations" in question
        or "list areas" in question
        or "which areas" in question
    ):
        areas = (
            df[df["location"] != "Unknown"]["location"]
            .value_counts()
        )

        if not areas.empty:

            result = []

            for area, count in areas.items():
                result.append(f"- {area}: {count}")

            return (
                "These are the recorded Nagpur areas in the "
                "available CrimeVista dataset:\n\n"
                + "\n".join(result)
            )

    # ---------------------------------------------------------
    # DATASET DATE RANGE
    # ---------------------------------------------------------

    if (
        "date range" in question
        or "time period" in question
        or "data period" in question
        or "when is the data" in question
    ):
        dated = df.dropna(subset=["crime_date"])

        if not dated.empty:

            first_date = dated["crime_date"].min()
            last_date = dated["crime_date"].max()

            return (
                f"The available crime records range from "
                f"**{first_date.strftime('%d %B %Y')}** to "
                f"**{last_date.strftime('%d %B %Y')}**."
            )

    # ---------------------------------------------------------
    # HELP
    # ---------------------------------------------------------

    if (
        "help" in question
        or "what can you do" in question
        or "what can i ask" in question
    ):
        return """
I can help you explore the available CrimeVista data.

You can ask questions such as:

- How many crimes are recorded?
- Which area has the most crimes?
- What is the most common crime?
- What crime types are recorded?
- What areas are covered?
- Show me information about Mahal.
- How many theft incidents are recorded?
- What are the recent crimes?
- What is the date range of the data?
"""

    # ---------------------------------------------------------
    # DEFAULT RESPONSE
    # ---------------------------------------------------------

    return """
I can answer questions about the crime records currently
available in CrimeVista.

Try asking:

**"How many crimes are recorded?"**

**"Which area has the most crimes?"**

**"What is the most common crime?"**

**"What crime types are recorded?"**

**"Show me information about Mahal."**

**"What are the recent crimes?"**
"""