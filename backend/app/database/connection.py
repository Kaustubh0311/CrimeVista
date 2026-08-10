import os

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker


load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not configured")


engine = create_engine(
    DATABASE_URL,
    echo=False
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def test_database_connection():

    try:

        with engine.connect() as connection:

            connection.execute(
                text("SELECT 1")
            )

        return True

    except Exception as error:

        print(
            "Database connection error:",
            error
        )

        return False