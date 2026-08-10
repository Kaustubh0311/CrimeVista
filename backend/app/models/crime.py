from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import Date
from sqlalchemy import Time
from sqlalchemy import Text

from backend.app.database.base import Base


class CrimeRecord(Base):

    __tablename__ = "crime_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    crime_id = Column(
        String(100),
        unique=True,
        nullable=True
    )

    crime_type = Column(
        String(100),
        nullable=True
    )

    crime_date = Column(
        Date,
        nullable=True
    )

    crime_time = Column(
        Time,
        nullable=True
    )

    location = Column(
        String(255),
        nullable=True
    )

    city = Column(
        String(100),
        nullable=True
    )

    state = Column(
        String(100),
        nullable=True
    )

    latitude = Column(
        Float,
        nullable=True
    )

    longitude = Column(
        Float,
        nullable=True
    )

    description = Column(
        Text,
        nullable=True
    )