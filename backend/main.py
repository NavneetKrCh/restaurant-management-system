from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from datetime import datetime, timedelta
import asyncio
import logging
from typing import List, Dict, Any, Optional

from database import DatabaseManager
from models import *
from ml_predictions import PredictionEngine
from sync_service import SyncService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global instances
db_manager = None
prediction_engine = None
sync_service = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup"""
    global db_manager, prediction_engine, sync_service
    
    logger.info("Starting Restaurant Management API...")
    
    # Initialize database
    db_manager = DatabaseManager()
    logger.info("Database initialized")
    
    # Initialize prediction engine
    prediction_engine = PredictionEngine(db_manager)
    logger.info("Prediction engine initialized")
    
    # Initialize sync service
    sync_service = SyncService(db_manager, prediction_engine)
    
    # Start background sync task
    asyncio.create_task(sync_service.start_auto_sync())
    logger.info("Auto-sync service started")
    
    yield
    
    # Cleanup
    if sync_service:
        await sync_service.stop_auto_sync()
    logger.info("Services stopped")

app = FastAPI(
    title="Restaurant Management API",
    description="Complete restaurant management system with ML predictions",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    """Dependency to get database manager"""
    if db_manager is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return db_manager

def get_prediction_engine():
    """Dependency to get prediction engine"""
    if prediction_engine is None:
        raise HTTPException(status_code=500, detail="Prediction engine not initialized")
    return prediction_engine

# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "database": db_manager is not None,
            "predictions": prediction_engine is not None,
            "sync": sync_service is not None
        }
    }

# Dishes endpoints
@app.get("/api/dishes", response_model=ApiResponse[List[DishResponse]])
async def get_dishes(db: DatabaseManager = Depends(get_db)):
    """Get all active dishes"""
    try:
        dishes = db.get_dishes()
        return ApiResponse(success=True, data=dishes)
    except Exception as e:
        logger.error(f"Error fetching dishes: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dishes", response_model=ApiResponse[DishResponse])
async def create_dish(dish: DishCreate, db: DatabaseManager = Depends(get_db)):
    """Create a new dish"""
    try:
        dish_id = db.create_dish(dish.model_dump())
        created_dish = db.get_dish_by_id(dish_id)
        return ApiResponse(success=True, data=created_dish)
    except Exception as e:
        logger.error(f"Error creating dish: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/dishes/{dish_id}", response_model=ApiResponse[DishResponse])
async def update_dish(dish_id: str, dish: DishUpdate, db: DatabaseManager = Depends(get_db)):
    """Update a dish"""
    try:
        db.update_dish(dish_id, dish.model_dump(exclude_unset=True))
        updated_dish = db.get_dish_by_id(dish_id)
        if not updated_dish:
            raise HTTPException(status_code=404, detail="Dish not found")
        return ApiResponse(success=True, data=updated_dish)
    except Exception as e:
        logger.error(f"Error updating dish: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/dishes/{dish_id}", response_model=ApiResponse[dict])
async def delete_dish(dish_id: str, db: DatabaseManager = Depends(get_db)):
    """Delete a dish (soft delete)"""
    try:
        success = db.delete_dish(dish_id)
        if not success:
            raise HTTPException(status_code=404, detail="Dish not found")
        return ApiResponse(success=True, data={"message": "Dish deleted successfully"})
    except Exception as e:
        logger.error(f"Error deleting dish: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Ingredients endpoints
@app.get("/api/ingredients", response_model=ApiResponse[List[IngredientResponse]])
async def get_ingredients(db: DatabaseManager = Depends(get_db)):
    """Get all ingredients"""
    try:
        ingredients = db.get_ingredients()
        return ApiResponse(success=True, data=ingredients)
    except Exception as e:
        logger.error(f"Error fetching ingredients: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ingredients", response_model=ApiResponse[IngredientResponse])
async def create_ingredient(ingredient: IngredientCreate, db: DatabaseManager = Depends(get_db)):
    """Create a new ingredient"""
    try:
        ingredient_id = db.create_ingredient(ingredient.model_dump())
        created_ingredient = db.get_ingredient_by_id(ingredient_id)
        return ApiResponse(success=True, data=created_ingredient)
    except Exception as e:
        logger.error(f"Error creating ingredient: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/ingredients/{ingredient_id}/quantity", response_model=ApiResponse[IngredientResponse])
async def update_ingredient_quantity(
    ingredient_id: str, 
    quantity_update: QuantityUpdate, 
    db: DatabaseManager = Depends(get_db)
):
    """Update ingredient quantity"""
    try:
        db.update_ingredient_quantity(ingredient_id, quantity_update.quantity)
        updated_ingredient = db.get_ingredient_by_id(ingredient_id)
        if not updated_ingredient:
            raise HTTPException(status_code=404, detail="Ingredient not found")
        return ApiResponse(success=True, data=updated_ingredient)
    except Exception as e:
        logger.error(f"Error updating ingredient quantity: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Orders endpoints
@app.get("/api/orders", response_model=ApiResponse[List[OrderResponse]])
async def get_orders(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: DatabaseManager = Depends(get_db)
):
    """Get orders with optional date filtering"""
    try:
        orders = db.get_orders(start_date, end_date)
        return ApiResponse(success=True, data=orders)
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/orders", response_model=ApiResponse[OrderResponse])
async def create_order(order: OrderCreate, db: DatabaseManager = Depends(get_db)):
    """Create a new order"""
    try:
        order_id = db.create_order(order.model_dump())
        created_order = db.get_order_by_id(order_id)
        return ApiResponse(success=True, data=created_order)
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@app.get("/api/analytics/sales", response_model=ApiResponse[List[SalesData]])
async def get_sales_data(
    start_date: str,
    end_date: str,
    db: DatabaseManager = Depends(get_db)
):
    """Get sales data for date range"""
    try:
        sales_data = db.get_sales_data(start_date, end_date)
        return ApiResponse(success=True, data=sales_data)
    except Exception as e:
        logger.error(f"Error fetching sales data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analytics/daily-sales", response_model=ApiResponse[SalesData])
async def get_daily_sales(date: str, db: DatabaseManager = Depends(get_db)):
    """Get sales data for a specific date"""
    try:
        daily_sales = db.get_daily_sales(date)
        if not daily_sales:
            raise HTTPException(status_code=404, detail="No sales data found for this date")
        return ApiResponse(success=True, data=daily_sales)
    except Exception as e:
        logger.error(f"Error fetching daily sales: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Predictions endpoints
@app.get("/api/predictions", response_model=ApiResponse[List[PredictionData]])
async def get_predictions(
    date: str,
    engine: PredictionEngine = Depends(get_prediction_engine)
):
    """Get ML predictions for a specific date"""
    try:
        predictions = engine.get_predictions(date)
        return ApiResponse(success=True, data=predictions)
    except Exception as e:
        logger.error(f"Error fetching predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predictions/generate", response_model=ApiResponse[dict])
async def generate_predictions(
    engine: PredictionEngine = Depends(get_prediction_engine)
):
    """Generate new predictions using ML models"""
    try:
        result = await engine.generate_predictions()
        return ApiResponse(success=True, data=result)
    except Exception as e:
        logger.error(f"Error generating predictions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Sync endpoints
@app.post("/api/sync", response_model=ApiResponse[dict])
async def manual_sync():
    """Trigger manual sync"""
    try:
        if sync_service:
            result = await sync_service.manual_sync()
            return ApiResponse(success=True, data=result)
        else:
            raise HTTPException(status_code=500, detail="Sync service not available")
    except Exception as e:
        logger.error(f"Error during sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sync/status", response_model=ApiResponse[dict])
async def get_sync_status():
    """Get sync service status"""
    try:
        if sync_service:
            status = sync_service.get_status()
            return ApiResponse(success=True, data=status)
        else:
            raise HTTPException(status_code=500, detail="Sync service not available")
    except Exception as e:
        logger.error(f"Error getting sync status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
