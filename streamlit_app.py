import streamlit as st
import requests
import folium
import pandas as pd
import plotly.express as px

from streamlit_folium import st_folium

from streamlit_api import (
    login_user,
    get_current_user,
    get_crimes,
    get_crime_locations
)


# =========================================================
# CONFIG
# =========================================================

st.set_page_config(
    page_title="CrimeVista",
    page_icon="🚨",
    layout="wide",
    initial_sidebar_state="expanded"
)

API_URL = "http://127.0.0.1:8000"

NAGPUR_LAT_MIN = 20.95
NAGPUR_LAT_MAX = 21.35
NAGPUR_LON_MIN = 78.85
NAGPUR_LON_MAX = 79.35

NAGPUR_CENTER = [21.1458, 79.0882]


# =========================================================
# SESSION STATE
# =========================================================

defaults = {
    "page": "landing",
    "logged_in": False,
    "token": None,
    "user": None,
    "role": None
}

for key, value in defaults.items():

    if key not in st.session_state:
        st.session_state[key] = value


# =========================================================
# CSS
# =========================================================

st.markdown(
    """
    <style>

    .main {
        background-color: #0f1117;
    }

    .hero {
        padding: 45px;
        border-radius: 20px;
        background: linear-gradient(
            135deg,
            #171a21,
            #241216
        );
        border: 1px solid #3a2025;
        margin-bottom: 30px;
    }

    .hero-title {
        font-size: 52px;
        font-weight: 800;
    }

    .hero-subtitle {
        font-size: 23px;
        color: #cccccc;
    }

    .card {
        padding: 25px;
        border-radius: 15px;
        background: #171a21;
        border: 1px solid #292d35;
        min-height: 145px;
    }

    .card-title {
        font-size: 21px;
        font-weight: 700;
        margin-bottom: 10px;
    }

    .card-text {
        color: #bbbbbb;
    }

    </style>
    """,
    unsafe_allow_html=True
)


# =========================================================
# API HELPERS
# =========================================================

def register_user(name, email, password, role):

    response = requests.post(
        f"{API_URL}/auth/register",
        json={
            "name": name,
            "email": email,
            "password": password,
            "role": role
        },
        timeout=15
    )

    if response.status_code not in [200, 201]:

        try:
            message = response.json().get(
                "detail",
                "Registration failed"
            )
        except Exception:
            message = "Registration failed"

        raise Exception(message)

    return response.json()


def nagpur_crimes(crimes):

    result = []

    for crime in crimes:

        try:

            lat = float(crime.get("latitude"))
            lon = float(crime.get("longitude"))

        except (ValueError, TypeError):

            continue

        if (
            NAGPUR_LAT_MIN <= lat <= NAGPUR_LAT_MAX
            and
            NAGPUR_LON_MIN <= lon <= NAGPUR_LON_MAX
        ):

            result.append(crime)

    return result


# =========================================================
# LANDING PAGE
# =========================================================

def show_landing():

    st.markdown(
        """
        <div class="hero">

            <div class="hero-title">
                🚨 CrimeVista
            </div>

            <div class="hero-subtitle">
                Nagpur Crime Analysis & Prediction System
            </div>

            <br>

            <p>
                Analyse historical crime patterns,
                visualise crime hotspots and explore
                area-based crime information for Nagpur.
            </p>

        </div>
        """,
        unsafe_allow_html=True
    )

    col1, col2 = st.columns(2)

    with col1:

        if st.button(
            "🔐 Login",
            use_container_width=True
        ):

            st.session_state.page = "login"
            st.rerun()

    with col2:

        if st.button(
            "📝 Create Account",
            use_container_width=True
        ):

            st.session_state.page = "register"
            st.rerun()

    st.markdown("##")

    st.subheader("CrimeVista Features")

    features = [
        ("🗺️", "Crime Map",
         "Interactive crime locations across Nagpur."),
        ("🔥", "Crime Hotspots",
         "Visualise concentrations of recorded crime."),
        ("📊", "Crime Trends",
         "Analyse crime activity over time."),
        ("📍", "Area Explorer",
         "Explore crime activity by area."),
        ("🚨", "Crime Alerts",
         "Identify areas with elevated historical activity."),
        ("🛡️", "Safety Recommendations",
         "View general area-based safety guidance.")
    ]

    for start in range(0, len(features), 3):

        cols = st.columns(3)

        for col, feature in zip(
            cols,
            features[start:start + 3]
        ):

            icon, title, text = feature

            with col:

                st.markdown(
                    f"""
                    <div class="card">

                        <div class="card-title">
                            {icon} {title}
                        </div>

                        <div class="card-text">
                            {text}
                        </div>

                    </div>
                    """,
                    unsafe_allow_html=True
                )


# =========================================================
# LOGIN
# =========================================================

def show_login():

    st.title("🔐 CrimeVista Login")

    email = st.text_input(
        "Email",
        key="login_email"
    )

    password = st.text_input(
        "Password",
        type="password",
        key="login_password"
    )

    col1, col2 = st.columns(2)

    with col1:

        if st.button(
            "Login",
            use_container_width=True
        ):

            if not email or not password:

                st.warning(
                    "Enter email and password."
                )

            else:

                try:

                    result = login_user(
                        email,
                        password
                    )

                    token = result["access_token"]

                    user = get_current_user(token)

                    st.session_state.token = token
                    st.session_state.user = user
                    st.session_state.role = user.get("role")
                    st.session_state.logged_in = True
                    st.session_state.page = "dashboard"

                    st.rerun()

                except Exception as error:

                    st.error(
                        f"Login failed: {error}"
                    )

    with col2:

        if st.button(
            "← Back",
            use_container_width=True
        ):

            st.session_state.page = "landing"
            st.rerun()

    st.markdown("---")

    if st.button("Create Account"):

        st.session_state.page = "register"
        st.rerun()


# =========================================================
# REGISTER
# =========================================================

def show_register():

    st.title("📝 Create CrimeVista Account")

    name = st.text_input(
        "Full Name"
    )

    email = st.text_input(
        "Email"
    )

    password = st.text_input(
        "Password",
        type="password"
    )

    role = st.selectbox(
        "Role",
        [
            "user",
            "officer",
            "admin"
        ]
    )

    col1, col2 = st.columns(2)

    with col1:

        if st.button(
            "Create Account",
            use_container_width=True
        ):

            if not name or not email or not password:

                st.warning(
                    "Please fill all fields."
                )

            else:

                try:

                    register_user(
                        name,
                        email,
                        password,
                        role
                    )

                    st.success(
                        "Account created successfully."
                    )

                    st.session_state.page = "login"

                    st.rerun()

                except Exception as error:

                    st.error(
                        f"Registration failed: {error}"
                    )

    with col2:

        if st.button(
            "← Back",
            use_container_width=True
        ):

            st.session_state.page = "landing"
            st.rerun()


# =========================================================
# DASHBOARD
# =========================================================

def show_dashboard():

    st.sidebar.title("🚨 CrimeVista")

    if st.session_state.user:

        st.sidebar.write(
            f"👤 {st.session_state.user.get('name', 'User')}"
        )

        st.sidebar.write(
            f"Role: {st.session_state.role}"
        )

    st.sidebar.markdown("---")

    page = st.sidebar.radio(
        "MAIN MENU",
        [
            "Overview",
            "Crime Map",
            "Hotspots",
            "Crime Trends",
            "Risk Forecast",
            "Area Explorer"
        ]
    )

    st.sidebar.markdown("---")

    page2 = st.sidebar.radio(
        "INFORMATION",
        [
            "Crime Alerts",
            "Safety Recommendations",
            "Reports",
            "My Profile"
        ]
    )

    # Keep second menu only if user selects it
    if st.session_state.get("selected_info"):

        pass

    st.sidebar.markdown("---")

    if st.sidebar.button(
        "🚪 Logout",
        use_container_width=True
    ):

        st.session_state.token = None
        st.session_state.user = None
        st.session_state.role = None
        st.session_state.logged_in = False
        st.session_state.page = "landing"

        st.rerun()

    # Information menu selection
    if st.session_state.get("info_page"):

        active_page = st.session_state.info_page
        st.session_state.info_page = None

    else:

        active_page = page

    # Radio for information pages separately
    if page2 != "Crime Alerts":
        pass

    # Use sidebar buttons for information section
    for information_page in [
        "Crime Alerts",
        "Safety Recommendations",
        "Reports",
        "My Profile"
    ]:

        if st.sidebar.button(
            information_page,
            use_container_width=True,
            key=f"info_{information_page}"
        ):

            active_page = information_page

    # =====================================================
    # OVERVIEW
    # =====================================================

    if active_page == "Overview":

        st.title("🏠 CrimeVista Dashboard")

        st.write(
            "Nagpur Crime Analysis Overview"
        )

        try:

            crimes = get_crimes(
                st.session_state.token
            )

            crimes = nagpur_crimes(crimes)

            locations = set()

            crime_types = set()

            for crime in crimes:

                if crime.get("location"):
                    locations.add(
                        crime.get("location")
                    )

                if crime.get("crime_type"):
                    crime_types.add(
                        crime.get("crime_type")
                    )

            c1, c2, c3, c4 = st.columns(4)

            c1.metric(
                "Total Crime Records",
                len(crimes)
            )

            c2.metric(
                "Areas",
                len(locations)
            )

            c3.metric(
                "Crime Types",
                len(crime_types)
            )

            c4.metric(
                "Coverage",
                "Nagpur"
            )

            st.markdown("---")

            st.subheader(
                "📋 Recent Crime Records"
            )

            if crimes:

                records = []

                for crime in crimes[:20]:

                    records.append(
                        {
                            "ID": crime.get("id"),
                            "Crime Type": crime.get(
                                "crime_type"
                            ),
                            "Location": crime.get(
                                "location"
                            ),
                            "Date": str(
                                crime.get("crime_date")
                            )
                        }
                    )

                st.dataframe(
                    records,
                    use_container_width=True,
                    hide_index=True
                )

            else:

                st.info(
                    "No crime records available."
                )

        except Exception as error:

            st.error(
                f"Unable to load dashboard: {error}"
            )


    # =====================================================
    # CRIME MAP
    # =====================================================

    elif active_page == "Crime Map":

        st.title("🗺️ Nagpur Crime Map")

        try:

            crimes = nagpur_crimes(
                get_crimes(
                    st.session_state.token
                )
            )

            crime_map = folium.Map(
                location=NAGPUR_CENTER,
                zoom_start=12,
                control_scale=True
            )

            count = 0

            for crime in crimes:

                try:

                    lat = float(
                        crime.get("latitude")
                    )

                    lon = float(
                        crime.get("longitude")
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    continue

                popup = f"""
                <div style="width:230px">

                    <h4>🚨 Crime Record</h4>

                    <b>Crime Type:</b>
                    {crime.get("crime_type", "Unknown")}

                    <br><br>

                    <b>Location:</b>
                    {crime.get("location", "Unknown")}

                    <br><br>

                    <b>Date:</b>
                    {crime.get("crime_date", "Unknown")}

                    <br><br>

                    <b>Description:</b>
                    {crime.get("description", "")}

                </div>
                """

                folium.Marker(
                    location=[
                        lat,
                        lon
                    ],
                    popup=folium.Popup(
                        popup,
                        max_width=300
                    ),
                    tooltip=str(
                        crime.get(
                            "crime_type",
                            "Crime"
                        )
                    )
                ).add_to(
                    crime_map
                )

                count += 1

            st_folium(
                crime_map,
                height=650,
                width=None,
                returned_objects=[]
            )

            st.metric(
                "Mapped Crime Locations",
                count
            )

        except Exception as error:

            st.error(
                f"Unable to load map: {error}"
            )


    # =====================================================
    # HOTSPOTS
    # =====================================================

    elif active_page == "Hotspots":

        st.title("🔥 Nagpur Crime Hotspots")

        try:

            crimes = nagpur_crimes(
                get_crimes(
                    st.session_state.token
                )
            )

            heat_data = []

            for crime in crimes:

                try:

                    lat = float(
                        crime.get("latitude")
                    )

                    lon = float(
                        crime.get("longitude")
                    )

                except (
                    ValueError,
                    TypeError
                ):

                    continue

                heat_data.append(
                    [
                        lat,
                        lon,
                        1
                    ]
                )

            hotspot_map = folium.Map(
                location=NAGPUR_CENTER,
                zoom_start=11,
                control_scale=True
            )

            if heat_data:

                from folium.plugins import HeatMap

                HeatMap(
                    heat_data,
                    radius=25,
                    blur=20,
                    min_opacity=0.35,
                    max_zoom=13
                ).add_to(
                    hotspot_map
                )

            st_folium(
                hotspot_map,
                height=650,
                width=None,
                returned_objects=[]
            )

            st.markdown("---")

            area_counts = {}

            for crime in crimes:

                area = crime.get(
                    "location"
                )

                if area:

                    area_counts[area] = (
                        area_counts.get(
                            area,
                            0
                        ) + 1
                    )

            st.subheader(
                "📍 Area-wise Crime Concentration"
            )

            sorted_areas = sorted(
                area_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )

            for area, count in sorted_areas[:10]:

                st.write(
                    f"📍 **{area}** — "
                    f"{count} incidents"
                )

        except Exception as error:

            st.error(
                f"Unable to load hotspots: {error}"
            )


    # =====================================================
    # CRIME TRENDS
    # =====================================================

    elif active_page == "Crime Trends":

        st.title("📊 Crime Trends")

        try:

            crimes = nagpur_crimes(
                get_crimes(
                    st.session_state.token
                )
            )

            if not crimes:

                st.info(
                    "No crime data available."
                )

            else:

                df = pd.DataFrame(
                    crimes
                )

                df["crime_date"] = pd.to_datetime(
                    df["crime_date"],
                    errors="coerce"
                )

                df = df.dropna(
                    subset=["crime_date"]
                )

                # -------------------------------
                # DAILY TREND
                # -------------------------------

                daily = (
                    df.groupby(
                        df["crime_date"].dt.date
                    )
                    .size()
                    .reset_index(
                        name="Crime Count"
                    )
                )

                daily.columns = [
                    "Date",
                    "Crime Count"
                ]

                fig = px.line(
                    daily,
                    x="Date",
                    y="Crime Count",
                    markers=True,
                    title="Crime Activity Over Time"
                )

                st.plotly_chart(
                    fig,
                    use_container_width=True
                )

                # -------------------------------
                # CRIME TYPE
                # -------------------------------

                st.subheader(
                    "Crime Type Distribution"
                )

                type_counts = (
                    df["crime_type"]
                    .fillna("Unknown")
                    .value_counts()
                    .reset_index()
                )

                type_counts.columns = [
                    "Crime Type",
                    "Count"
                ]

                fig2 = px.bar(
                    type_counts,
                    x="Crime Type",
                    y="Count",
                    title="Crime Type Distribution"
                )

                st.plotly_chart(
                    fig2,
                    use_container_width=True
                )

        except Exception as error:

            st.error(
                f"Unable to generate trends: {error}"
            )


    # =====================================================
    # RISK FORECAST
    # =====================================================

    elif active_page == "Risk Forecast":

        st.title("🔮 Risk Forecast")

        st.info(
            "The ML forecasting module will be enabled "
            "after the larger Nagpur dataset is uploaded "
            "and the prediction model is trained."
        )

        st.markdown("---")

        st.subheader(
            "Planned Forecast"
        )

        st.write(
            "The model will estimate next-day aggregate "
            "crime activity by area and classify activity "
            "into LOW, MEDIUM and HIGH levels."
        )


    # =====================================================
    # AREA EXPLORER
    # =====================================================

    elif active_page == "Area Explorer":

        st.title("📍 Area Explorer")

        try:

            crimes = nagpur_crimes(
                get_crimes(
                    st.session_state.token
                )
            )

            areas = sorted(
                set(
                    crime.get("location")
                    for crime in crimes
                    if crime.get("location")
                )
            )

            if areas:

                selected_area = st.selectbox(
                    "Select Nagpur Area",
                    areas
                )

                selected = [
                    crime
                    for crime in crimes
                    if crime.get(
                        "location"
                    ) == selected_area
                ]

                st.metric(
                    "Recorded Crimes",
                    len(selected)
                )

                crime_types = {}

                for crime in selected:

                    crime_type = crime.get(
                        "crime_type",
                        "Unknown"
                    )

                    crime_types[crime_type] = (
                        crime_types.get(
                            crime_type,
                            0
                        ) + 1
                    )

                st.subheader(
                    "Crime Types in Selected Area"
                )

                st.dataframe(
                    [
                        {
                            "Crime Type": key,
                            "Count": value
                        }
                        for key, value
                        in sorted(
                            crime_types.items(),
                            key=lambda x: x[1],
                            reverse=True
                        )
                    ],
                    use_container_width=True,
                    hide_index=True
                )

                st.subheader(
                    "Crime Records"
                )

                records = []

                for crime in selected:

                    records.append(
                        {
                            "Crime Type": crime.get(
                                "crime_type"
                            ),
                            "Date": str(
                                crime.get(
                                    "crime_date"
                                )
                            ),
                            "Description": crime.get(
                                "description",
                                ""
                            )
                        }
                    )

                st.dataframe(
                    records,
                    use_container_width=True,
                    hide_index=True
                )

            else:

                st.info(
                    "No areas available."
                )

        except Exception as error:

            st.error(
                f"Unable to load area explorer: {error}"
            )


    # =====================================================
    # CRIME ALERTS
    # =====================================================

    elif active_page == "Crime Alerts":

        st.title("🚨 Crime Alerts")

        try:

            crimes = nagpur_crimes(
                get_crimes(
                    st.session_state.token
                )
            )

            area_counts = {}

            for crime in crimes:

                area = crime.get(
                    "location"
                )

                if area:

                    area_counts[area] = (
                        area_counts.get(
                            area,
                            0
                        ) + 1
                    )

            if area_counts:

                average = (
                    sum(area_counts.values())
                    / len(area_counts)
                )

                alerts = []

                for area, count in sorted(
                    area_counts.items(),
                    key=lambda x: x[1],
                    reverse=True
                ):

                    if count >= average * 1.5:

                        alerts.append(
                            (
                                area,
                                count
                            )
                        )

                if alerts:

                    for area, count in alerts:

                        st.warning(
                            f"🚨 Elevated historical "
                            f"activity in **{area}** — "
                            f"{count} recorded incidents."
                        )

                else:

                    st.success(
                        "No elevated historical area "
                        "activity detected."
                    )

            else:

                st.info(
                    "No crime data available."
                )

        except Exception as error:

            st.error(
                f"Unable to generate alerts: {error}"
            )


    # =====================================================
    # SAFETY RECOMMENDATIONS
    # =====================================================

    elif active_page == "Safety Recommendations":

        st.title(
            "🧠 Safety Recommendations"
        )

        st.write(
            "General safety guidance based on "
            "historical crime activity."
        )

        st.markdown("---")

        st.subheader(
            "🛡️ General Safety Guidance"
        )

        st.info(
            "Stay aware of your surroundings and "
            "follow local safety guidance."
        )

        st.info(
            "Use well-lit routes and avoid isolated "
            "areas when travelling."
        )

        st.info(
            "Historical crime activity does not mean "
            "that a future incident will occur."
        )

        try:

            crimes = nagpur_crimes(
                get_crimes(
                    st.session_state.token
                )
            )

            area_counts = {}

            for crime in crimes:

                area = crime.get(
                    "location"
                )

                if area:

                    area_counts[area] = (
                        area_counts.get(
                            area,
                            0
                        ) + 1
                    )

            st.markdown("---")

            st.subheader(
                "📍 Area Activity"
            )

            for area, count in sorted(
                area_counts.items(),
                key=lambda x: x[1],
                reverse=True
            )[:10]:

                if count >= 8:

                    level = "HIGH"

                elif count >= 4:

                    level = "MEDIUM"

                else:

                    level = "LOW"

                st.write(
                    f"📍 **{area}** — "
                    f"{count} records — "
                    f"**{level} historical activity**"
                )

        except Exception as error:

            st.error(
                f"Unable to load recommendations: {error}"
            )


    # =====================================================
    # REPORTS
    # =====================================================

    elif active_page == "Reports":

        st.title("📄 Crime Reports")

        try:

            crimes = nagpur_crimes(
                get_crimes(
                    st.session_state.token
                )
            )

            if crimes:

                df = pd.DataFrame(
                    crimes
                )

                st.subheader(
                    "Report Preview"
                )

                st.dataframe(
                    df,
                    use_container_width=True,
                    hide_index=True
                )

                csv_data = df.to_csv(
                    index=False
                )

                st.download_button(
                    "⬇️ Download CSV Report",
                    csv_data,
                    "CrimeVista_Nagpur_Report.csv",
                    "text/csv",
                    use_container_width=True
                )

            else:

                st.info(
                    "No crime records available."
                )

        except Exception as error:

            st.error(
                f"Unable to generate report: {error}"
            )


    # =====================================================
    # PROFILE
    # =====================================================

    elif active_page == "My Profile":

        st.title("👤 My Profile")

        user = st.session_state.user

        if user:

            col1, col2 = st.columns(2)

            with col1:

                st.subheader(
                    "Account Information"
                )

                st.write(
                    f"**Name:** "
                    f"{user.get('name', '-')}"
                )

                st.write(
                    f"**Email:** "
                    f"{user.get('email', '-')}"
                )

            with col2:

                st.subheader(
                    "Account Status"
                )

                st.write(
                    f"**Role:** "
                    f"{user.get('role', '-')}"
                )

                st.write(
                    f"**Active:** "
                    f"{user.get('is_active', '-')}"
                )

        else:

            st.warning(
                "Profile information unavailable."
            )


# =========================================================
# APPLICATION ROUTING
# =========================================================

if st.session_state.page == "landing":

    show_landing()

elif st.session_state.page == "login":

    show_login()

elif st.session_state.page == "register":

    show_register()

elif st.session_state.page == "dashboard":

    if st.session_state.token:

        show_dashboard()

    else:

        st.session_state.page = "login"

        st.rerun()