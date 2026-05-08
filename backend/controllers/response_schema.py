from pydantic import BaseModel
from typing import Any

from typing import Generic, TypeVar

T = TypeVar("T")

class ResponseSchema(BaseModel, Generic[T]):
    message: str
    data: T