"""
Enums matching the Prisma schema for ETS IV&V Report data
"""

from enum import Enum

class Role(Enum):
    VENDOR = "VENDOR"
    ETS = "ETS"

class Severity(Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Likelihood(Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class Status(Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class ProjectStatus(Enum):
    PENDING = "PENDING"
    DENIED = "DENIED"
    APPROVED = "APPROVED"

class Month(Enum):
    JANUARY = "JANUARY"
    FEBRUARY = "FEBRUARY"
    MARCH = "MARCH"
    APRIL = "APRIL"
    MAY = "MAY"
    JUNE = "JUNE"
    JULY = "JULY"
    AUGUST = "AUGUST"
    SEPTEMBER = "SEPTEMBER"
    OCTOBER = "OCTOBER"
    NOVEMBER = "NOVEMBER"
    DECEMBER = "DECEMBER"

    @classmethod
    def from_string(cls, month_str):
        """Convert string to Month enum, handling common variations"""
        month_map = {
            'jan': cls.JANUARY, 'january': cls.JANUARY, '1': cls.JANUARY,
            'feb': cls.FEBRUARY, 'february': cls.FEBRUARY, '2': cls.FEBRUARY,
            'mar': cls.MARCH, 'march': cls.MARCH, '3': cls.MARCH,
            'apr': cls.APRIL, 'april': cls.APRIL, '4': cls.APRIL,
            'may': cls.MAY, '5': cls.MAY,
            'jun': cls.JUNE, 'june': cls.JUNE, '6': cls.JUNE,
            'jul': cls.JULY, 'july': cls.JULY, '7': cls.JULY,
            'aug': cls.AUGUST, 'august': cls.AUGUST, '8': cls.AUGUST,
            'sep': cls.SEPTEMBER, 'september': cls.SEPTEMBER, '9': cls.SEPTEMBER,
            'oct': cls.OCTOBER, 'october': cls.OCTOBER, '10': cls.OCTOBER,
            'nov': cls.NOVEMBER, 'november': cls.NOVEMBER, '11': cls.NOVEMBER,
            'dec': cls.DECEMBER, 'december': cls.DECEMBER, '12': cls.DECEMBER,
        }
        return month_map.get(month_str.lower(), None)