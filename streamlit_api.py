import requests


# --------------------------------------------------
# FASTAPI URL
# --------------------------------------------------

API_URL = "http://127.0.0.1:8000"


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

def login_user(email, password):

    response = requests.post(
        f"{API_URL}/auth/login",
        json={
            "email": email,
            "password": password
        },
        timeout=10
    )

    if response.status_code == 200:

        return response.json()

    try:
        error = response.json().get(
            "detail",
            "Login failed"
        )
    except Exception:
        error = "Login failed"

    raise Exception(error)


# --------------------------------------------------
# GET USER PROFILE
# --------------------------------------------------

def get_current_user(token):

    response = requests.get(
        f"{API_URL}/auth/me",
        headers={
            "Authorization": f"Bearer {token}"
        },
        timeout=10
    )

    if response.status_code == 200:

        return response.json()

    try:
        error = response.json().get(
            "detail",
            "Unable to get user profile"
        )
    except Exception:
        error = "Unable to get user profile"

    raise Exception(error)


# --------------------------------------------------
# GET CRIME RECORDS
# --------------------------------------------------

def get_crimes(token):

    response = requests.get(
        f"{API_URL}/crimes/",
        headers={
            "Authorization": f"Bearer {token}"
        },
        timeout=15
    )

    if response.status_code == 200:

        return response.json()

    try:
        error = response.json().get(
            "detail",
            "Unable to fetch crime data"
        )
    except Exception:
        error = "Unable to fetch crime data"

    raise Exception(error)


# --------------------------------------------------
# GET CRIME LOCATIONS
# --------------------------------------------------

def get_crime_locations(token):

    response = requests.get(
        f"{API_URL}/crimes/locations",
        headers={
            "Authorization": f"Bearer {token}"
        },
        timeout=10
    )

    if response.status_code == 200:

        return response.json()

    try:
        error = response.json().get(
            "detail",
            "Unable to fetch crime locations"
        )
    except Exception:
        error = "Unable to fetch crime locations"

    raise Exception(error)