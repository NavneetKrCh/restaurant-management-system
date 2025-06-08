import sqlite3
import json
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class DatabaseManager:
    def __init__(self, db_path: str = "restaurant.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with all required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys = ON")
        
        # Dishes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dishes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                preparation_time INTEGER,
                difficulty_level TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Ingredients table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ingredients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                unit TEXT NOT NULL,
                quantity_today REAL DEFAULT 0,
                min_threshold REAL DEFAULT 0,
                cost_per_unit REAL DEFAULT 0,
                supplier TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Dish ingredients relationship table with sub-ingredients
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dish_ingredients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dish_id TEXT NOT NULL,
                ingredient_id TEXT NOT NULL,
                quantity REAL NOT NULL,
                unit TEXT NOT NULL,
                sub_ingredient_data TEXT, -- JSON string for SubIngredient
                FOREIGN KEY (dish_id) REFERENCES dishes (id) ON DELETE CASCADE,
                FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
            )
        ''')
        
        # Orders table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                total REAL NOT NULL,
                subtotal REAL NOT NULL,
                tax REAL NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status TEXT DEFAULT 'pending',
                payment_method TEXT,
                customer_id TEXT,
                cashier_id TEXT
            )
        ''')
        
        # Order items table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                dish_id TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                notes TEXT,
                FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
                FOREIGN KEY (dish_id) REFERENCES dishes (id)
            )
        ''')
        
        # Sales analytics table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sales_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                period TEXT NOT NULL,
                orders_count INTEGER DEFAULT 0,
                revenue REAL DEFAULT 0,
                avg_order_value REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, period)
            )
        ''')
        
        # Predictions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dish_id TEXT NOT NULL,
                prediction_date DATE NOT NULL,
                period TEXT NOT NULL,
                predicted_demand INTEGER NOT NULL,
                confidence REAL NOT NULL,
                recommended_prep INTEGER NOT NULL,
                factors TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dish_id) REFERENCES dishes (id),
                UNIQUE(dish_id, prediction_date, period)
            )
        ''')
        
        # Inventory transactions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ingredient_id TEXT NOT NULL,
                transaction_type TEXT NOT NULL,
                quantity_change REAL NOT NULL,
                reference_id TEXT,
                notes TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ingredient_id) REFERENCES ingredients (id)
            )
        ''')
        
        # System sync log table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sync_type TEXT NOT NULL,
                status TEXT NOT NULL,
                records_affected INTEGER DEFAULT 0,
                error_message TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    
    def get_connection(self):
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    # Ingredient operations
    def create_ingredient(self, ingredient_data: Dict[str, Any]) -> str:
        """Create a new ingredient"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            ingredient_id = str(uuid.uuid4())
            
            cursor.execute('''
                INSERT INTO ingredients (id, name, unit, quantity_today, min_threshold, cost_per_unit, supplier)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                ingredient_id,
                ingredient_data['name'],
                ingredient_data['unit'],
                ingredient_data.get('quantity_today', 0),
                ingredient_data.get('min_threshold', 0),
                ingredient_data.get('cost_per_unit', 0),
                ingredient_data.get('supplier')
            ))
            
            conn.commit()
            return ingredient_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def get_ingredients(self) -> List[Dict[str, Any]]:
        """Get all ingredients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM ingredients ORDER BY name')
        ingredients = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return ingredients
    
    def get_ingredient_by_id(self, ingredient_id: str) -> Optional[Dict[str, Any]]:
        """Get ingredient by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM ingredients WHERE id = ?', (ingredient_id,))
        row = cursor.fetchone()
        
        conn.close()
        return dict(row) if row else None
    
    def update_ingredient_quantity(self, ingredient_id: str, quantity: float):
        """Update ingredient quantity"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                UPDATE ingredients 
                SET quantity_today = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (quantity, ingredient_id))
            
            # Log transaction
            cursor.execute('''
                INSERT INTO inventory_transactions 
                (ingredient_id, transaction_type, quantity_change, notes)
                VALUES (?, 'adjustment', ?, 'Manual quantity update')
            ''', (ingredient_id, quantity))
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    # Dish operations
    def create_dish(self, dish_data: Dict[str, Any]) -> str:
        """Create a new dish with ingredients and sub-ingredients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            dish_id = str(uuid.uuid4())
            
            # Insert dish
            cursor.execute('''
                INSERT INTO dishes (id, name, price, category, description, preparation_time, difficulty_level, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                dish_id,
                dish_data['name'],
                dish_data['price'],
                dish_data['category'],
                dish_data.get('description'),
                dish_data.get('preparation_time'),
                dish_data.get('difficulty_level'),
                dish_data.get('is_active', True)
            ))
            
            # Insert dish ingredients with sub-ingredients
            for ingredient in dish_data.get('ingredients', []):
                sub_ingredient_json = None
                if 'sub_ingredient' in ingredient and ingredient['sub_ingredient']:
                    sub_ingredient_json = json.dumps(ingredient['sub_ingredient'])
                
                cursor.execute('''
                    INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity, unit, sub_ingredient_data)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    dish_id,
                    ingredient['ingredient_id'],
                    ingredient['quantity'],
                    ingredient['unit'],
                    sub_ingredient_json
                ))
            
            conn.commit()
            return dish_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def get_dishes(self) -> List[Dict[str, Any]]:
        """Get all active dishes with their ingredients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get dishes
        cursor.execute('SELECT * FROM dishes WHERE is_active = 1 ORDER BY name')
        dishes = [dict(row) for row in cursor.fetchall()]
        
        # Get ingredients for each dish
        for dish in dishes:
            cursor.execute('''
                SELECT di.ingredient_id, di.quantity, di.unit, di.sub_ingredient_data, i.name
                FROM dish_ingredients di
                JOIN ingredients i ON di.ingredient_id = i.id
                WHERE di.dish_id = ?
            ''', (dish['id'],))
            
            ingredients = []
            for row in cursor.fetchall():
                ingredient = {
                    'ingredient_id': row['ingredient_id'],
                    'quantity': row['quantity'],
                    'unit': row['unit'],
                    'name': row['name']
                }
                
                # Parse sub-ingredient data
                if row['sub_ingredient_data']:
                    try:
                        ingredient['sub_ingredient'] = json.loads(row['sub_ingredient_data'])
                    except json.JSONDecodeError:
                        logger.warning(f"Invalid sub-ingredient data for dish {dish['id']}")
                
                ingredients.append(ingredient)
            
            dish['ingredients'] = ingredients
        
        conn.close()
        return dishes
    
    def get_dish_by_id(self, dish_id: str) -> Optional[Dict[str, Any]]:
        """Get dish by ID with ingredients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM dishes WHERE id = ?', (dish_id,))
        dish_row = cursor.fetchone()
        
        if not dish_row:
            conn.close()
            return None
        
        dish = dict(dish_row)
        
        # Get ingredients
        cursor.execute('''
            SELECT di.ingredient_id, di.quantity, di.unit, di.sub_ingredient_data, i.name
            FROM dish_ingredients di
            JOIN ingredients i ON di.ingredient_id = i.id
            WHERE di.dish_id = ?
        ''', (dish_id,))
        
        ingredients = []
        for row in cursor.fetchall():
            ingredient = {
                'ingredient_id': row['ingredient_id'],
                'quantity': row['quantity'],
                'unit': row['unit'],
                'name': row['name']
            }
            
            if row['sub_ingredient_data']:
                try:
                    ingredient['sub_ingredient'] = json.loads(row['sub_ingredient_data'])
                except json.JSONDecodeError:
                    logger.warning(f"Invalid sub-ingredient data for dish {dish_id}")
            
            ingredients.append(ingredient)
        
        dish['ingredients'] = ingredients
        
        conn.close()
        return dish
    
    def update_dish(self, dish_id: str, dish_data: Dict[str, Any]):
        """Update a dish"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            # Update dish basic info
            update_fields = []
            params = []
            
            for field in ['name', 'price', 'category', 'description', 'preparation_time', 'difficulty_level', 'is_active']:
                if field in dish_data:
                    update_fields.append(f"{field} = ?")
                    params.append(dish_data[field])
            
            if update_fields:
                update_fields.append("updated_at = CURRENT_TIMESTAMP")
                params.append(dish_id)
                
                cursor.execute(f'''
                    UPDATE dishes SET {', '.join(update_fields)}
                    WHERE id = ?
                ''', params)
            
            # Update ingredients if provided
            if 'ingredients' in dish_data:
                # Delete existing ingredients
                cursor.execute('DELETE FROM dish_ingredients WHERE dish_id = ?', (dish_id,))
                
                # Insert new ingredients
                for ingredient in dish_data['ingredients']:
                    sub_ingredient_json = None
                    if 'sub_ingredient' in ingredient and ingredient['sub_ingredient']:
                        sub_ingredient_json = json.dumps(ingredient['sub_ingredient'])
                    
                    cursor.execute('''
                        INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity, unit, sub_ingredient_data)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        dish_id,
                        ingredient['ingredient_id'],
                        ingredient['quantity'],
                        ingredient['unit'],
                        sub_ingredient_json
                    ))
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def delete_dish(self, dish_id: str) -> bool:
        """Delete a dish (soft delete)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                UPDATE dishes 
                SET is_active = 0, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (dish_id,))
            
            success = cursor.rowcount > 0
            conn.commit()
            return success
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    # Order operations
    def create_order(self, order_data: Dict[str, Any]) -> str:
        """Create a new order and update inventory"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            order_id = str(uuid.uuid4())
            
            # Insert order
            cursor.execute('''
                INSERT INTO orders (id, total, subtotal, tax, status, payment_method, customer_id, cashier_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                order_id,
                order_data['total'],
                order_data['subtotal'],
                order_data['tax'],
                'completed',
                order_data['payment_method'],
                order_data.get('customer_id'),
                order_data['cashier_id']
            ))
            
            # Insert order items and update inventory
            for item in order_data['items']:
                cursor.execute('''
                    INSERT INTO order_items (order_id, dish_id, quantity, price, notes)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    order_id,
                    item['dish_id'],
                    item['quantity'],
                    item['price'],
                    item.get('notes', '')
                ))
                
                # Update ingredient quantities
                self._update_inventory_for_dish(cursor, item['dish_id'], item['quantity'], order_id)
            
            conn.commit()
            return order_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def _update_inventory_for_dish(self, cursor, dish_id: str, quantity: int, order_id: str):
        """Update ingredient inventory when dish is ordered"""
        cursor.execute('''
            SELECT ingredient_id, quantity FROM dish_ingredients WHERE dish_id = ?
        ''', (dish_id,))
        
        ingredients = cursor.fetchall()
        
        for ingredient in ingredients:
            ingredient_id = ingredient['ingredient_id']
            usage_quantity = ingredient['quantity'] * quantity
            
            # Update ingredient quantity
            cursor.execute('''
                UPDATE ingredients 
                SET quantity_today = quantity_today - ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (usage_quantity, ingredient_id))
            
            # Log inventory transaction
            cursor.execute('''
                INSERT INTO inventory_transactions 
                (ingredient_id, transaction_type, quantity_change, reference_id)
                VALUES (?, 'usage', ?, ?)
            ''', (ingredient_id, -usage_quantity, order_id))
    
    def get_orders(self, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get orders with optional date filtering"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = 'SELECT * FROM orders'
        params = []
        
        if start_date and end_date:
            query += ' WHERE DATE(timestamp) BETWEEN ? AND ?'
            params.extend([start_date, end_date])
        elif start_date:
            query += ' WHERE DATE(timestamp) >= ?'
            params.append(start_date)
        elif end_date:
            query += ' WHERE DATE(timestamp) <= ?'
            params.append(end_date)
        
        query += ' ORDER BY timestamp DESC'
        
        cursor.execute(query, params)
        orders = [dict(row) for row in cursor.fetchall()]
        
        # Get items for each order
        for order in orders:
            cursor.execute('''
                SELECT oi.*, d.name as dish_name
                FROM order_items oi
                JOIN dishes d ON oi.dish_id = d.id
                WHERE oi.order_id = ?
            ''', (order['id'],))
            
            order['items'] = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return orders
    
    def get_order_by_id(self, order_id: str) -> Optional[Dict[str, Any]]:
        """Get order by ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM orders WHERE id = ?', (order_id,))
        order_row = cursor.fetchone()
        
        if not order_row:
            conn.close()
            return None
        
        order = dict(order_row)
        
        # Get items
        cursor.execute('''
            SELECT oi.*, d.name as dish_name
            FROM order_items oi
            JOIN dishes d ON oi.dish_id = d.id
            WHERE oi.order_id = ?
        ''', (order_id,))
        
        order['items'] = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return order
    
    # Analytics operations
    def get_sales_data(self, start_date: str, end_date: str) -> List[Dict[str, Any]]:
        """Get sales data for date range with time period breakdown"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                DATE(timestamp) as date,
                CASE 
                    WHEN CAST(strftime('%H', timestamp) AS INTEGER) BETWEEN 6 AND 11 THEN 'morning'
                    WHEN CAST(strftime('%H', timestamp) AS INTEGER) BETWEEN 12 AND 17 THEN 'afternoon'
                    WHEN CAST(strftime('%H', timestamp) AS INTEGER) BETWEEN 18 AND 23 THEN 'evening'
                    ELSE 'other'
                END as period,
                COUNT(*) as orders_count,
                SUM(total) as revenue,
                AVG(total) as avg_order_value
            FROM orders 
            WHERE DATE(timestamp) BETWEEN ? AND ? AND status = 'completed'
            GROUP BY DATE(timestamp), period
            ORDER BY date, period
        ''', (start_date, end_date))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Group by date and structure the response
        sales_by_date = {}
        for row in results:
            date = row['date']
            if date not in sales_by_date:
                sales_by_date[date] = {
                    'date': date,
                    'morning': {'orders': 0, 'revenue': 0.0, 'avg_order': 0.0},
                    'afternoon': {'orders': 0, 'revenue': 0.0, 'avg_order': 0.0},
                    'evening': {'orders': 0, 'revenue': 0.0, 'avg_order': 0.0},
                    'total': {'orders': 0, 'revenue': 0.0, 'avg_order': 0.0}
                }
            
            period = row['period']
            if period in ['morning', 'afternoon', 'evening']:
                sales_by_date[date][period] = {
                    'orders': row['orders_count'],
                    'revenue': float(row['revenue'] or 0),
                    'avg_order': float(row['avg_order_value'] or 0)
                }
        
        # Calculate totals
        for date_data in sales_by_date.values():
            total_orders = (date_data['morning']['orders'] + 
                          date_data['afternoon']['orders'] + 
                          date_data['evening']['orders'])
            total_revenue = (date_data['morning']['revenue'] + 
                           date_data['afternoon']['revenue'] + 
                           date_data['evening']['revenue'])
            
            date_data['total'] = {
                'orders': total_orders,
                'revenue': total_revenue,
                'avg_order': total_revenue / total_orders if total_orders > 0 else 0.0
            }
        
        return list(sales_by_date.values())
    
    def get_daily_sales(self, date: str) -> Optional[Dict[str, Any]]:
        """Get detailed sales data for a specific date"""
        sales_data = self.get_sales_data(date, date)
        return sales_data[0] if sales_data else None
    
    # Prediction operations
    def save_predictions(self, predictions: List[Dict[str, Any]]):
        """Save ML model predictions"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            for pred in predictions:
                cursor.execute('''
                    INSERT OR REPLACE INTO predictions 
                    (dish_id, prediction_date, period, predicted_demand, confidence, recommended_prep, factors)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    pred['dish_id'],
                    pred['prediction_date'],
                    pred['period'],
                    pred['predicted_demand'],
                    pred['confidence'],
                    pred['recommended_prep'],
                    json.dumps(pred.get('factors', []))
                ))
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def get_predictions(self, date: str) -> List[Dict[str, Any]]:
        """Get predictions for a specific date"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT p.*, d.name as dish_name
            FROM predictions p
            JOIN dishes d ON p.dish_id = d.id
            WHERE p.prediction_date = ?
        ''', (date,))
        
        predictions = []
        for row in cursor.fetchall():
            pred = dict(row)
            try:
                pred['factors'] = json.loads(pred['factors']) if pred['factors'] else []
            except json.JSONDecodeError:
                pred['factors'] = []
            predictions.append(pred)
        
        conn.close()
        return predictions

    def get_historical_order_data(self, days: int = 30) -> List[Dict[str, Any]]:
        """Get historical order data for ML training"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT 
                DATE(o.timestamp) as ds,
                CASE 
                    WHEN CAST(strftime('%H', o.timestamp) AS INTEGER) BETWEEN 6 AND 11 THEN 'morning'
                    WHEN CAST(strftime('%H', o.timestamp) AS INTEGER) BETWEEN 12 AND 17 THEN 'afternoon'
                    WHEN CAST(strftime('%H', o.timestamp) AS INTEGER) BETWEEN 18 AND 23 THEN 'evening'
                    ELSE 'other'
                END as period,
                oi.dish_id,
                d.name as dish_name,
                SUM(oi.quantity) as y,
                strftime('%w', o.timestamp) as day_of_week,
                strftime('%m', o.timestamp) as month
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN dishes d ON oi.dish_id = d.id
            WHERE o.status = 'completed' 
            AND DATE(o.timestamp) >= DATE('now', '-{} days')
            GROUP BY DATE(o.timestamp), period, oi.dish_id
            ORDER BY ds, dish_id, period
        '''.format(days))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
