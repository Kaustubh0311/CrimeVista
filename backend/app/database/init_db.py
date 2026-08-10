from backend.app.database.connection import engine
from backend.app.database.base import Base

from backend.app.models.crime import CrimeRecord


def create_tables():

    Base.metadata.create_all(
        bind=engine
    )

    print("Database tables created successfully.")


if __name__ == "__main__":
    create_tables()