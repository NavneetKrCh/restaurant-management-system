# SQLite database schema for the restaurant management system
import sqlite3
from datetime import datetime
from typing import List, Dict, Any

class DatabaseManager:
    def __init__(self, db_path: str = "restaurant.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize the database with all required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Dishes table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dishes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                category TEXT NOT NULL,
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
        
        # Dish ingredients relationship table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS dish_ingredients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dish_id TEXT NOT NULL,
                ingredient_id TEXT NOT NULL,
                quantity REAL NOT NULL,
                FOREIGN KEY (dish_id) REFERENCES dishes (id),
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
                FOREIGN KEY (order_id) REFERENCES orders (id),
                FOREIGN KEY (dish_id) REFERENCES dishes (id)
            )
        ''')
        
        # Sales analytics table (for caching computed analytics)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sales_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date DATE NOT NULL,
                period TEXT NOT NULL, -- 'morning', 'afternoon', 'evening', 'total'
                orders_count INTEGER DEFAULT 0,
                revenue REAL DEFAULT 0,
                avg_order_value REAL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(date, period)
            )
        ''')
        
        # Predictions table (for ML model results)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dish_id TEXT NOT NULL,
                prediction_date DATE NOT NULL,
                period TEXT NOT NULL,
                predicted_demand INTEGER NOT NULL,
                confidence REAL NOT NULL,
                recommended_prep INTEGER NOT NULL,
                factors TEXT, -- JSON string of factors
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dish_id) REFERENCES dishes (id),
                UNIQUE(dish_id, prediction_date, period)
            )
        ''')
        
        # Inventory transactions table (for tracking stock changes)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inventory_transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ingredient_id TEXT NOT NULL,
                transaction_type TEXT NOT NULL, -- 'usage', 'restock', 'adjustment'
                quantity_change REAL NOT NULL,
                reference_id TEXT, -- order_id for usage, supplier_id for restock
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
    
    def get_connection(self):
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    # Dishes operations
    def create_dish(self, dish_data: Dict[str, Any]) -> str:
        """Create a new dish with ingredients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            dish_id = dish_data['id']
            
            # Insert dish
            cursor.execute('''
                INSERT INTO dishes (id, name, price, category, is_active)
                VALUES (?, ?, ?, ?, ?)
            ''', (dish_id, dish_data['name'], dish_data['price'], 
                  dish_data['category'], dish_data.get('is_active', True)))
            
            # Insert dish ingredients
            for ingredient in dish_data.get('ingredients', []):
                cursor.execute('''
                    INSERT INTO dish_ingredients (dish_id, ingredient_id, quantity)
                    VALUES (?, ?, ?)
                ''', (dish_id, ingredient['ingredient_id'], ingredient['quantity']))
            
            conn.commit()
            return dish_id
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def get_dishes(self) -> List[Dict[str, Any]]:
        """Get all dishes with their ingredients"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get dishes
        cursor.execute('SELECT * FROM dishes WHERE is_active = 1')
        dishes = [dict(row) for row in cursor.fetchall()]
        
        # Get ingredients for each dish
        for dish in dishes:
            cursor.execute('''
                SELECT di.ingredient_id, di.quantity, i.name, i.unit
                FROM dish_ingredients di
                JOIN ingredients i ON di.ingredient_id = i.id
                WHERE di.dish_id = ?
            ''', (dish['id'],))
            
            dish['ingredients'] = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        return dishes
    
    # Orders operations
    def create_order(self, order_data: Dict[str, Any]) -> str:
        """Create a new order and update inventory"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            order_id = order_data['id']
            
            # Insert order
            cursor.execute('''
                INSERT INTO orders (id, total, subtotal, tax, status, payment_method, cashier_id)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (order_id, order_data['total'], order_data['subtotal'], 
                  order_data['tax'], order_data['status'], 
                  order_data['payment_method'], order_data['cashier_id']))
            
            # Insert order items and update inventory
            for item in order_data['items']:
                cursor.execute('''
                    INSERT INTO order_items (order_id, dish_id, quantity, price, notes)
                    VALUES (?, ?, ?, ?, ?)
                ''', (order_id, item['dish_id'], item['quantity'], 
                      item['price'], item.get('notes', '')))
                
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
        # Get dish ingredients
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
                    'morning': {'orders': 0, 'revenue': 0, 'avgOrder': 0},
                    'afternoon': {'orders': 0, 'revenue': 0, 'avgOrder': 0},
                    'evening': {'orders': 0, 'revenue': 0, 'avgOrder': 0},
                    'total': {'orders': 0, 'revenue': 0, 'avgOrder': 0}
                }
            
            period = row['period']
            if period in ['morning', 'afternoon', 'evening']:
                sales_by_date[date][period] = {
                    'orders': row['orders_count'],
                    'revenue': row['revenue'],
                    'avgOrder': row['avg_order_value']
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
                'avgOrder': total_revenue / total_orders if total_orders > 0 else 0
            }
        
        return list(sales_by_date.values())
    
    def get_daily_sales(self, date: str) -> Dict[str, Any]:
        """Get detailed sales data for a specific date"""
        sales_data = self.get_sales_data(date, date)
        return sales_data[0] if sales_data else None
    
    # Prediction operations (for ML integration)
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
                ''', (pred['dish_id'], pred['prediction_date'], pred['period'],
                      pred['predicted_demand'], pred['confidence'], 
                      pred['recommended_prep'], pred.get('factors', '')))
            
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
            SELECT * FROM predictions WHERE prediction_date = ?
        ''', (date,))
        
        predictions = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return predictions

# Example usage and testing
if __name__ == "__main__":
    db = DatabaseManager()
    print("Database initialized successfully!")
    
    # Example: Create sample data
    sample_dish = {
        'id': 'dish_1',
        'name': 'Margherita Pizza',
        'price': 12.99,
        'category': 'Pizza',
        'ingredients': [
            {'ingredient_id': 'ing_1', 'quantity': 200},
            {'ingredient_id': 'ing_2', 'quantity': 150}
        ]
    }
    
    try:
        dish_id = db.create_dish(sample_dish)
        print(f"Created dish: {dish_id}")
        
        dishes = db.get_dishes()
        print(f"Total dishes: {len(dishes)}")
        
    except Exception as e:
        print(f"Error: {e}")
