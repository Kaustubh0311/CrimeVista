# ============================================================
# CRIMEVISTA - STREAMLIT APPLICATION
# Uses existing CrimeVista PostgreSQL database
# ============================================================

import streamlit as st
import pandas as pd
import numpy as np
import folium
import plotly.express as px

from pathlib import Path
from datetime import datetime

from folium.plugins import HeatMap
from streamlit_folium import st_folium

# ============================================================
# EXISTING CRIMEVISTA BACKEND
# ============================================================

from backend.app.database.connection import SessionLocal
from backend.app.models.user import User
from backend.app.models.crime import CrimeRecord
from backend.app.auth.security import (
    verify_password,
    hash_password
)


# ============================================================
# PAGE CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="CrimeVista",
    page_icon="🚨",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# CUSTOM CSS
# ============================================================

st.markdown(
    """
    <style>

    /* Main page */

    .stApp {
        background-color: #0f1117;
    }

    .main {
        padding-top: 1rem;
    }

    /* Titles */

    h1, h2, h3 {
        color: #ffffff !important;
    }

    p, label, span {
        color: #d9d9d9;
    }

    /* Sidebar */

    section[data-testid="stSidebar"] {
        background-color: #151820;
        border-right: 1px solid #292d38;
    }

    section[data-testid="stSidebar"] h1,
    section[data-testid="stSidebar"] h2,
    section[data-testid="stSidebar"] h3 {
        color: #ffffff !important;
    }

    /* Buttons */

    .stButton > button {
        border-radius: 8px;
        min-height: 42px;
        font-weight: 600;
    }

    /* Metric cards */

    div[data-testid="metric-container"] {
        background-color: #191c24;
        border: 1px solid #2b303b;
        border-radius: 12px;
        padding: 15px;
    }

    /* Input fields */

    .stTextInput input,
    .stSelectbox select,
    .stNumberInput input {
        background-color: #1b1e27 !important;
        color: white !important;
        border-radius: 8px !important;
    }

    /* Cards */

    .cv-card {
        background: #191c24;
        border: 1px solid #2b303b;
        border-radius: 14px;
        padding: 22px;
        margin-bottom: 18px;
    }

    .cv-card h3 {
        margin-top: 0;
    }

    .hero-card {
        background: linear-gradient(
            135deg,
            #24171a,
            #17191f
        );
        border: 1px solid #553036;
        border-radius: 18px;
        padding: 35px;
        margin-bottom: 25px;
    }

    .hero-title {
        font-size: 38px;
        font-weight: 800;
        color: white;
        margin-bottom: 8px;
    }

    .hero-subtitle {
        font-size: 17px;
        color: #bfc3cc;
    }

    .risk-high {
        color: #ff5555;
        font-weight: 800;
    }

    .risk-medium {
        color: #ffbd45;
        font-weight: 800;
    }

    .risk-low {
        color: #5bd68a;
        font-weight: 800;
    }

    .small-text {
        color: #9da3ae;
        font-size: 13px;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# ============================================================
# SESSION STATE
# ============================================================

if "page" not in st.session_state:
    st.session_state.page = "landing"

if "logged_in" not in st.session_state:
    st.session_state.logged_in = False

if "user" not in st.session_state:
    st.session_state.user = None

if "role" not in st.session_state:
    st.session_state.role = None


# ============================================================
# DATABASE AUTHENTICATION
# ============================================================

def authenticate_user(email, password):

    db = SessionLocal()

    try:

        email = email.strip().lower()

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user is None:
            return None, "Invalid email or password."

        if not verify_password(
            password,
            user.password_hash
        ):
            return None, "Invalid email or password."

        if not user.is_active:
            return None, "This account is inactive."

        return {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }, None

    except Exception as error:

        return None, f"Database error: {error}"

    finally:

        db.close()


def register_user(
    name,
    email,
    password,
    role
):

    db = SessionLocal()

    try:

        name = name.strip()
        email = email.strip().lower()
        role = role.strip().lower()

        if not name:
            return False, "Please enter your name."

        if not email:
            return False, "Please enter your email."

        if not password:
            return False, "Please enter a password."

        if len(password) < 6:
            return False, "Password must contain at least 6 characters."

        if role not in [
            "user",
            "officer",
            "admin"
        ]:
            return False, "Invalid account role."

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            return False, "Email already registered."

        new_user = User(
            name=name,
            email=email,
            password_hash=hash_password(password),
            role=role,
            is_active=True
        )

        db.add(new_user)

        db.commit()

        db.refresh(new_user)

        return True, "Account created successfully."

    except Exception as error:

        db.rollback()

        return False, f"Registration failed: {error}"

    finally:

        db.close()


# ============================================================
# GET CRIME DATA
# ============================================================

def get_crime_data():

    db = SessionLocal()

    try:

        crimes = (
            db.query(CrimeRecord)
            .order_by(CrimeRecord.id.desc())
            .all()
        )

        records = []

        for crime in crimes:

            records.append(
                {
                    "id": crime.id,
                    "crime_type": crime.crime_type,
                    "location": crime.location,
                    "latitude": crime.latitude,
                    "longitude": crime.longitude,
                    "crime_date": crime.crime_date,
                    "description": crime.description
                }
            )

        return pd.DataFrame(records)

    except Exception as error:

        st.error(
            f"Unable to load crime data: {error}"
        )

        return pd.DataFrame()

    finally:

        db.close()


# ============================================================
# NAGPUR FILTER
# ============================================================

def filter_nagpur(df):

    if df.empty:
        return df

    data = df.copy()

    if "latitude" not in data.columns:
        return data

    if "longitude" not in data.columns:
        return data

    data["latitude"] = pd.to_numeric(
        data["latitude"],
        errors="coerce"
    )

    data["longitude"] = pd.to_numeric(
        data["longitude"],
        errors="coerce"
    )

    data = data.dropna(
        subset=[
            "latitude",
            "longitude"
        ]
    )

    # Approximate Nagpur bounding box

    data = data[
        (data["latitude"] >= 20.95)
        &
        (data["latitude"] <= 21.35)
        &
        (data["longitude"] >= 78.85)
        &
        (data["longitude"] <= 79.35)
    ]

    return data


# ============================================================
# LANDING PAGE
# ============================================================

def landing_page():

    st.markdown(
        """
        <div class="hero-card">

            <div class="hero-title">
                🚨 CrimeVista
            </div>

            <div class="hero-subtitle">
                Nagpur Crime Intelligence & Public Safety Platform
            </div>

            <br>

            <div class="small-text">
                Explore historical crime activity, locations,
                hotspots, trends and safety information for Nagpur.
            </div>

        </div>
        """,
        unsafe_allow_html=True
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.markdown(
            """
            <div class="cv-card">

            ### 🗺️ Crime Map

            Explore recorded crime locations
            across Nagpur.

            </div>
            """,
            unsafe_allow_html=True
        )

    with col2:

        st.markdown(
            """
            <div class="cv-card">

            ### 🔥 Crime Hotspots

            Identify areas with higher
            historical crime concentration.

            </div>
            """,
            unsafe_allow_html=True
        )

    with col3:

        st.markdown(
            """
            <div class="cv-card">

            ### 📊 Crime Trends

            Understand crime patterns
            through interactive charts.

            </div>
            """,
            unsafe_allow_html=True
        )

    st.markdown("")

    col1, col2, col3 = st.columns(
        [1, 1, 1]
    )

    with col2:

        if st.button(
            "🔐 Login",
            use_container_width=True,
            type="primary"
        ):

            st.session_state.page = "login"

            st.rerun()

        if st.button(
            "📝 Create Account",
            use_container_width=True
        ):

            st.session_state.page = "register"

            st.rerun()


# ============================================================
# LOGIN PAGE
# ============================================================

def login_page():

    st.markdown(
        """
        <div class="hero-card">

            <div class="hero-title">
                🔐 CrimeVista Login
            </div>

            <div class="hero-subtitle">
                Sign in to access your CrimeVista dashboard.
            </div>

        </div>
        """,
        unsafe_allow_html=True
    )

    col1, col2, col3 = st.columns(
        [1, 2, 1]
    )

    with col2:

        email = st.text_input(
            "Email",
            placeholder="Enter your registered email",
            key="login_email"
        )

        password = st.text_input(
            "Password",
            type="password",
            placeholder="Enter your password",
            key="login_password"
        )

        if st.button(
            "Login",
            use_container_width=True,
            type="primary"
        ):

            if not email or not password:

                st.warning(
                    "Please enter your email and password."
                )

            else:

                user, error = authenticate_user(
                    email,
                    password
                )

                if error:

                    st.error(error)

                else:

                    st.session_state.logged_in = True

                    st.session_state.user = user

                    st.session_state.role = user["role"]

                    st.session_state.page = "dashboard"

                    st.rerun()

        st.markdown("---")

        if st.button(
            "📝 Create New Account",
            use_container_width=True
        ):

            st.session_state.page = "register"

            st.rerun()

        if st.button(
            "← Back to Home",
            use_container_width=True
        ):

            st.session_state.page = "landing"

            st.rerun()


# ============================================================
# REGISTER PAGE
# ============================================================

def register_page():

    st.markdown(
        """
        <div class="hero-card">

            <div class="hero-title">
                📝 Create Account
            </div>

            <div class="hero-subtitle">
                Create a new CrimeVista account.
            </div>

        </div>
        """,
        unsafe_allow_html=True
    )

    col1, col2 = st.columns(2)

    with col1:

        name = st.text_input(
            "Full Name",
            placeholder="Enter your full name"
        )

        email = st.text_input(
            "Email",
            placeholder="name@example.com"
        )

    with col2:

        password = st.text_input(
            "Password",
            type="password"
        )

        confirm_password = st.text_input(
            "Confirm Password",
            type="password"
        )

    role = st.selectbox(
        "Account Role",
        [
            "user",
            "officer",
            "admin"
        ]
    )

    st.caption(
        "Choose the role you want to use for this project."
    )

    st.markdown("---")

    col1, col2 = st.columns(2)

    with col1:

        if st.button(
            "Create Account",
            use_container_width=True,
            type="primary"
        ):

            if not name or not email or not password:

                st.warning(
                    "Please fill all required fields."
                )

            elif password != confirm_password:

                st.error(
                    "Passwords do not match."
                )

            else:

                success, message = register_user(
                    name,
                    email,
                    password,
                    role
                )

                if success:

                    st.success(message)

                    st.info(
                        "Account saved successfully. "
                        "Please login."
                    )

                    st.session_state.page = "login"

                    st.rerun()

                else:

                    st.error(message)

    with col2:

        if st.button(
            "← Back to Home",
            use_container_width=True
        ):

            st.session_state.page = "landing"

            st.rerun()


# ============================================================
# OVERVIEW
# ============================================================

def show_overview(df):

    st.title("🏠 CrimeVista Dashboard")

    user = st.session_state.user

    st.write(
        f"Welcome, **{user['name']}**"
    )

    st.caption(
        f"Logged in as: {user['role'].upper()}"
    )

    st.markdown("---")

    nagpur = filter_nagpur(df)

    total_records = len(nagpur)

    areas = 0

    if not nagpur.empty and "location" in nagpur.columns:

        areas = (
            nagpur["location"]
            .dropna()
            .nunique()
        )

    hotspots = 0

    if not nagpur.empty and "location" in nagpur.columns:

        counts = (
            nagpur["location"]
            .value_counts()
        )

        hotspots = len(
            counts[counts >= 3]
        )

    if total_records >= 50:
        risk = "HIGH"
    elif total_records >= 20:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Crime Records",
        total_records
    )

    col2.metric(
        "Areas Analysed",
        areas
    )

    col3.metric(
        "Hotspot Areas",
        hotspots
    )

    col4.metric(
        "Activity Level",
        risk
    )

    st.markdown("---")

    st.subheader(
        "Nagpur Crime Intelligence"
    )

    col1, col2 = st.columns(2)

    with col1:

        st.markdown(
            """
            <div class="cv-card">

            ### 🛡️ Public Safety

            CrimeVista provides historical crime information
            to help users understand crime patterns and
            area-wise activity across Nagpur.

            </div>
            """,
            unsafe_allow_html=True
        )

    with col2:

        st.markdown(
            """
            <div class="cv-card">

            ### 📍 Area-Based Analysis

            Use the Crime Map, Hotspots and Area Explorer
            to understand where historical incidents
            have been recorded.

            </div>
            """,
            unsafe_allow_html=True
        )


# ============================================================
# CRIME MAP
# ============================================================

def show_crime_map(df):

    st.title("🗺️ Nagpur Crime Map")

    st.write(
        "Interactive map showing recorded crime locations."
    )

    nagpur = filter_nagpur(df)

    if nagpur.empty:

        st.warning(
            "No Nagpur crime records with valid coordinates found."
        )

        return

    m = folium.Map(
        location=[
            21.1458,
            79.0882
        ],
        zoom_start=11,
        tiles="OpenStreetMap"
    )

    for _, row in nagpur.iterrows():

        crime_type = row.get(
            "crime_type",
            "Unknown"
        )

        location = row.get(
            "location",
            "Unknown"
        )

        crime_date = row.get(
            "crime_date",
            ""
        )

        popup = f"""
        <b>Crime Type:</b> {crime_type}<br>
        <b>Area:</b> {location}<br>
        <b>Date:</b> {crime_date}
        """

        folium.CircleMarker(
            location=[
                row["latitude"],
                row["longitude"]
            ],
            radius=6,
            popup=folium.Popup(
                popup,
                max_width=300
            ),
            fill=True
        ).add_to(m)

    st_folium(
        m,
        width=None,
        height=600
    )


# ============================================================
# HOTSPOTS
# ============================================================

def show_hotspots(df):

    st.title("🔥 Crime Hotspots")

    st.write(
        "Areas with higher historical crime concentration."
    )

    nagpur = filter_nagpur(df)

    if nagpur.empty:

        st.warning(
            "No Nagpur crime data available."
        )

        return

    if "location" not in nagpur.columns:

        st.warning(
            "Location information is not available."
        )

        return

    counts = (
        nagpur["location"]
        .fillna("Unknown")
        .value_counts()
        .reset_index()
    )

    counts.columns = [
        "Area",
        "Crime Records"
    ]

    st.subheader(
        "Area-wise Crime Concentration"
    )

    fig = px.bar(
        counts.head(15),
        x="Crime Records",
        y="Area",
        orientation="h",
        title="Top Crime Activity Areas"
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )

    st.markdown("---")

    st.subheader(
        "🔥 Geographic Heatmap"
    )

    heat_data = nagpur[
        [
            "latitude",
            "longitude"
        ]
    ].dropna()

    m = folium.Map(
        location=[
            21.1458,
            79.0882
        ],
        zoom_start=11
    )

    HeatMap(
        heat_data.values.tolist(),
        radius=18,
        blur=22,
        min_opacity=0.35
    ).add_to(m)

    st_folium(
        m,
        width=None,
        height=600
    )


# ============================================================
# CRIME TRENDS
# ============================================================

def show_trends(df):

    st.title("📊 Crime Trends")

    nagpur = filter_nagpur(df)

    if nagpur.empty:

        st.warning(
            "No Nagpur crime records available."
        )

        return

    nagpur["crime_date"] = pd.to_datetime(
        nagpur["crime_date"],
        errors="coerce"
    )

    nagpur = nagpur.dropna(
        subset=["crime_date"]
    )

    if nagpur.empty:

        st.warning(
            "No valid crime dates available."
        )

        return

    monthly = (
        nagpur
        .groupby(
            nagpur["crime_date"].dt.to_period("M")
        )
        .size()
        .reset_index(
            name="Crime Records"
        )
    )

    monthly["Month"] = (
        monthly["crime_date"]
        .astype(str)
    )

    fig = px.line(
        monthly,
        x="Month",
        y="Crime Records",
        markers=True,
        title="Monthly Crime Activity"
    )

    st.plotly_chart(
        fig,
        use_container_width=True
    )

    st.markdown("---")

    if "crime_type" in nagpur.columns:

        crime_types = (
            nagpur["crime_type"]
            .fillna("Unknown")
            .value_counts()
            .reset_index()
        )

        crime_types.columns = [
            "Crime Type",
            "Records"
        ]

        fig2 = px.bar(
            crime_types.head(15),
            x="Crime Type",
            y="Records",
            title="Crime Type Distribution"
        )

        st.plotly_chart(
            fig2,
            use_container_width=True
        )


# ============================================================
# AREA EXPLORER
# ============================================================

def show_area_explorer(df):

    st.title("📍 Area Explorer")

    nagpur = filter_nagpur(df)

    if nagpur.empty:

        st.warning(
            "No Nagpur crime records available."
        )

        return

    areas = sorted(
        nagpur["location"]
        .dropna()
        .astype(str)
        .unique()
    )

    if not areas:

        st.warning(
            "No areas available."
        )

        return

    selected_area = st.selectbox(
        "Select Area",
        areas
    )

    area_data = nagpur[
        nagpur["location"].astype(str)
        == selected_area
    ]

    st.markdown("---")

    col1, col2, col3 = st.columns(3)

    col1.metric(
        "Recorded Incidents",
        len(area_data)
    )

    if "crime_type" in area_data.columns:

        common_crime = (
            area_data["crime_type"]
            .fillna("Unknown")
            .value_counts()
            .index[0]
        )

    else:

        common_crime = "Unknown"

    col2.metric(
        "Most Recorded Crime",
        common_crime
    )

    if len(area_data) >= 8:

        activity = "HIGH"

    elif len(area_data) >= 4:

        activity = "MEDIUM"

    else:

        activity = "LOW"

    col3.metric(
        "Historical Activity",
        activity
    )

    st.markdown("---")

    if "crime_type" in area_data.columns:

        breakdown = (
            area_data["crime_type"]
            .fillna("Unknown")
            .value_counts()
            .reset_index()
        )

        breakdown.columns = [
            "Crime Type",
            "Records"
        ]

        fig = px.pie(
            breakdown,
            names="Crime Type",
            values="Records",
            title=f"Crime Distribution - {selected_area}"
        )

        st.plotly_chart(
            fig,
            use_container_width=True
        )


# ============================================================
# CRIME ALERTS
# ============================================================

def show_alerts(df):

    st.title("🚨 Crime Alerts")

    st.write(
        "Area-level alerts based on historical recorded activity."
    )

    nagpur = filter_nagpur(df)

    if nagpur.empty:

        st.info(
            "No crime data available for generating alerts."
        )

        return

    counts = (
        nagpur["location"]
        .fillna("Unknown")
        .value_counts()
    )

    high = counts[counts >= 8]

    medium = counts[
        (counts >= 4)
        & (counts < 8)
    ]

    if len(high) == 0 and len(medium) == 0:

        st.success(
            "No elevated historical activity areas detected."
        )

    if len(high) > 0:

        st.subheader(
            "🔴 High Historical Activity"
        )

        for area, count in high.items():

            st.error(
                f"{area}: {count} recorded incidents"
            )

    if len(medium) > 0:

        st.subheader(
            "🟠 Elevated Historical Activity"
        )

        for area, count in medium.items():

            st.warning(
                f"{area}: {count} recorded incidents"
            )

    st.caption(
        "These alerts describe historical activity and "
        "do not represent certainty about future incidents."
    )


# ============================================================
# SAFETY RECOMMENDATIONS
# ============================================================

def show_recommendations(df):

    st.title("🧠 Safety Recommendations")

    st.write(
        "General area-based safety guidance using historical activity."
    )

    nagpur = filter_nagpur(df)

    if nagpur.empty:

        st.info(
            "No historical crime data available."
        )

        return

    counts = (
        nagpur["location"]
        .fillna("Unknown")
        .value_counts()
    )

    st.subheader(
        "General Safety Guidance"
    )

    st.markdown(
        """
        - Stay aware of your surroundings.
        - Prefer well-lit and populated routes.
        - Keep valuables secure in crowded areas.
        - Use trusted transportation when travelling at night.
        - In an emergency, contact the appropriate local authorities.
        """
    )

    st.markdown("---")

    st.subheader(
        "Area Activity Guidance"
    )

    for area, count in counts.head(10).items():

        if count >= 8:

            level = "HIGH"

            message = (
                "Historical activity is relatively high. "
                "Use additional awareness and prefer populated routes."
            )

        elif count >= 4:

            level = "MEDIUM"

            message = (
                "Historical activity is elevated. "
                "Maintain normal safety precautions."
            )

        else:

            level = "LOW"

            message = (
                "Limited historical activity is recorded "
                "in the available dataset."
            )

        st.markdown(
            f"""
            <div class="cv-card">

            ### 📍 {area}

            <b>Historical Records:</b> {count}

            <br><br>

            <b>Activity Level:</b> {level}

            <br><br>

            {message}

            </div>
            """,
            unsafe_allow_html=True
        )


# ============================================================
# RISK FORECAST
# ============================================================

def show_forecast(df):

    st.title("🔮 Risk Forecast")

    st.write(
        "Aggregate area-level crime activity forecasting."
    )

    model_path = (
        Path(__file__).resolve().parent
        / "ml"
        / "models"
        / "crime_risk_model.joblib"
    )

    if not model_path.exists():

        st.info(
            "ML model is not available yet."
        )

        st.markdown(
            """
            ### Current Status

            The CrimeVista prediction module is ready
            for the trained ML model.

            The model should only be trained after
            sufficient historical Nagpur crime data is
            available.

            Current data is not sufficient to produce
            a reliable trained forecast model.
            """
        )

        return

    st.success(
        "ML model found."
    )

    st.info(
        "Model integration can use the existing CrimeVista "
        "training pipeline."
    )


# ============================================================
# REPORTS
# ============================================================

def show_reports(df):

    st.title("📄 Crime Reports")

    st.write(
        "Download an aggregated Nagpur crime data report."
    )

    nagpur = filter_nagpur(df)

    if nagpur.empty:

        st.warning(
            "No Nagpur data available."
        )

        return

    st.subheader(
        "Report Preview"
    )

    st.dataframe(
        nagpur,
        use_container_width=True,
        hide_index=True
    )

    csv_data = nagpur.to_csv(
        index=False
    ).encode("utf-8")

    st.download_button(
        "⬇️ Download CSV Report",
        data=csv_data,
        file_name="crimevista_nagpur_report.csv",
        mime="text/csv",
        use_container_width=True
    )


# ============================================================
# PROFILE
# ============================================================

def show_profile():

    st.title("👤 My Profile")

    user = st.session_state.user

    if not user:

        st.error(
            "User information is unavailable."
        )

        return

    initial = (
        user["name"][0].upper()
        if user.get("name")
        else "U"
    )

    st.markdown(
        f"""
        <div class="cv-card">

        <h2>👤 {initial}</h2>

        <h2>{user.get("name", "-")}</h2>

        <p>
        <b>Email:</b> {user.get("email", "-")}
        </p>

        <p>
        <b>Role:</b> {user.get("role", "-").upper()}
        </p>

        <p>
        <b>Status:</b> Active
        </p>

        </div>
        """,
        unsafe_allow_html=True
    )

    if st.button(
        "🚪 Logout",
        use_container_width=True
    ):

        st.session_state.logged_in = False
        st.session_state.user = None
        st.session_state.role = None
        st.session_state.page = "landing"

        st.rerun()


# ============================================================
# DASHBOARD
# ============================================================

def show_dashboard():

    user = st.session_state.user

    role = st.session_state.role

    # --------------------------------------------------------
    # SIDEBAR
    # --------------------------------------------------------

    st.sidebar.markdown(
        """
        <h1>🚨 CrimeVista</h1>
        """,
        unsafe_allow_html=True
    )

    st.sidebar.write(
        f"👤 {user['name']}"
    )

    st.sidebar.write(
        f"Role: **{role.upper()}**"
    )

    st.sidebar.markdown("---")

    menu = st.sidebar.radio(
        "Navigation",
        [
            "🏠 Overview",
            "🗺️ Crime Map",
            "🔥 Hotspots",
            "📊 Crime Trends",
            "🔮 Risk Forecast",
            "📍 Area Explorer",
            "🚨 Crime Alerts",
            "🧠 Safety Recommendations",
            "📄 Reports",
            "👤 My Profile"
        ]
    )

    st.sidebar.markdown("---")

    st.sidebar.caption(
        "CrimeVista\nNagpur Crime Intelligence"
    )

    # --------------------------------------------------------
    # LOAD DATA
    # --------------------------------------------------------

    @st.cache_data(ttl=30)
    def cached_crime_data():

        return get_crime_data()

    df = cached_crime_data()

    # --------------------------------------------------------
    # PAGE ROUTING
    # --------------------------------------------------------

    if menu == "🏠 Overview":

        show_overview(df)

    elif menu == "🗺️ Crime Map":

        show_crime_map(df)

    elif menu == "🔥 Hotspots":

        show_hotspots(df)

    elif menu == "📊 Crime Trends":

        show_trends(df)

    elif menu == "🔮 Risk Forecast":

        show_forecast(df)

    elif menu == "📍 Area Explorer":

        show_area_explorer(df)

    elif menu == "🚨 Crime Alerts":

        show_alerts(df)

    elif menu == "🧠 Safety Recommendations":

        show_recommendations(df)

    elif menu == "📄 Reports":

        show_reports(df)

    elif menu == "👤 My Profile":

        show_profile()


# ============================================================
# MAIN APPLICATION ROUTER
# ============================================================

if st.session_state.logged_in:

    show_dashboard()

else:

    if st.session_state.page == "login":

        login_page()

    elif st.session_state.page == "register":

        register_page()

    else:

        landing_page()