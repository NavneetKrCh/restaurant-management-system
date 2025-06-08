from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Generic, TypeVar
from datetime import datetime
from enum import Enum

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    """Generic API response model"""
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

class OrderStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TransactionType(str, Enum):
    USAGE = "usage"
    RESTOCK = "restock"
    ADJUSTMENT = "adjustment"

class TimePeriod(str, Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"

# Ingredient models
class SubIngredient(BaseModel):
    """Sub-ingredient model for combined ingredient states"""
    name: str
    description: Optional[str] = None
    preparation_method: Optional[str] = None
    cooking_time: Optional[int] = None  # in minutes
    temperature: Optional[str] = None
    notes: Optional[str] = None

class DishIngredient(BaseModel):
    ingredient_id: str
    quantity: float
    unit: str
    sub_ingredient: Optional[SubIngredient] = None

class IngredientBase(BaseModel):
    name: str
    unit: str
    cost_per_unit: Optional[float] = 0.0
    supplier: Optional[str] = None

class IngredientCreate(IngredientBase):
    quantity_today: float = 0
    min_threshold: float = 0

class IngredientUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    quantity_today: Optional[float] = None
    min_threshold: Optional[float] = None
    cost_per_unit: Optional[float] = None
    supplier: Optional[str] = None

class IngredientResponse(IngredientBase):
    id: str
    quantity_today: float
    min_threshold: float
    created_at: datetime
    updated_at: datetime

class QuantityUpdate(BaseModel):
    quantity: float

# Dish models
class DishBase(BaseModel):
    name: str
    price: float
    category: str
    description: Optional[str] = None
    preparation_time: Optional[int] = None  # in minutes
    difficulty_level: Optional[str] = None

class DishCreate(DishBase):
    ingredients: List[DishIngredient] = []

class DishUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    preparation_time: Optional[int] = None
    difficulty_level: Optional[str] = None
    ingredients: Optional[List[DishIngredient]] = None
    is_active: Optional[bool] = None

class DishResponse(DishBase):
    id: str
    ingredients: List[DishIngredient]
    is_active: bool
    created_at: datetime
    updated_at: datetime

# Order models
class OrderItem(BaseModel):
    dish_id: str
    quantity: int
    price: float
    notes: Optional[str] = None

class OrderBase(BaseModel):
    payment_method: str
    customer_id: Optional[str] = None
    cashier_id: str

class OrderCreate(OrderBase):
    items: List[OrderItem]
    subtotal: float
    tax: float
    total: float

class OrderResponse(OrderBase):
    id: str
    items: List[OrderItem]
    subtotal: float
    tax: float
    total: float
    timestamp: datetime
    status: OrderStatus

# Analytics models
class PeriodData(BaseModel):
    orders: int
    revenue: float
    avg_order: float

class SalesData(BaseModel):
    date: str
    morning: PeriodData
    afternoon: PeriodData
    evening: PeriodData
    total: PeriodData

# Prediction models
class PredictionData(BaseModel):
    dish_id: str
    dish_name: str
    period: TimePeriod
    predicted_demand: int
    confidence: float
    recommended_prep: int
    factors: List[str]
    prediction_date: str

class InventoryTransaction(BaseModel):
    id: int
    ingredient_id: str
    transaction_type: TransactionType
    quantity_change: float
    reference_id: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime

# System models
class SyncStatus(BaseModel):
    last_sync: Optional[datetime] = None
    is_running: bool = False
    records_synced: Dict[str, int] = {}
    errors: List[str] = []
