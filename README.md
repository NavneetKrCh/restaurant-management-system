# Restaurant Management System

A comprehensive restaurant management system with inventory tracking, order processing, analytics, and AI-powered predictions using Prophet by Meta.

## Features

### Core Functionality
- **Inventory Management**: Track ingredients, dishes, and stock levels with real-time low stock alerts
- **Order Processing**: Interactive order portal with automatic ingredient deduction
- **Analytics Dashboard**: 15-day sales analysis with time-based breakdowns
- **AI Predictions**: Prophet-powered demand forecasting for optimal preparation planning
- **Kitchen Dashboard**: Real-time preparation tasks and cooking management
- **Modern UI**: Dark/light mode support with responsive design

### Advanced Features
- **Sub-Ingredients**: Track combined ingredient states with preparation methods
- **Real-time Sync**: Automatic database synchronization
- **ML Forecasting**: Meta's Prophet library for accurate demand prediction
- **Time-based Analysis**: Morning, afternoon, and evening performance breakdown
- **Detailed Reporting**: Comprehensive sales and performance reports
- **Data Management**: Import/export capabilities with backup systems

## Tech Stack

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Zustand** for state management
- **Recharts** for data visualization

### Backend
- **FastAPI** (Python)
- **SQLite** database
- **Prophet** for ML predictions
- **Pandas** for data processing
- **Pydantic** for data validation
- **Uvicorn** ASGI server

## Installation & Setup

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.8+
- **npm** or **yarn**

### Backend Setup

1. **Navigate to backend directory**
   \`\`\`bash
   cd backend
   \`\`\`

2. **Run setup script**
   \`\`\`bash
   chmod +x setup.sh
   ./setup.sh
   \`\`\`

   Or manually:
   \`\`\`bash
   # Create virtual environment
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt
   \`\`\`

3. **Start the backend server**
   \`\`\`bash
   # Using the start script
   ./start.sh

   # Or manually
   source venv/bin/activate
   python run.py
   \`\`\`

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

2. **Start the development server**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

   The application will be available at `http://localhost:3000`

## Usage

### Getting Started

1. **Start both servers** (backend on :8000, frontend on :3000)
2. **Access the dashboard** at `http://localhost:3000`
3. **Add ingredients** in the Inventory section
4. **Create dishes** with ingredient combinations and sub-ingredients
5. **Process orders** in the Orders section
6. **View analytics** and predictions in respective sections

### Key Workflows

#### Setting Up Inventory
1. Go to **Inventory** → **Add Ingredient**
2. Set quantities and minimum thresholds
3. Create dishes and assign ingredients with sub-ingredient states
4. Monitor low stock alerts

#### Processing Orders
1. Navigate to **Orders**
2. Select dishes from the menu
3. Add to cart and complete order
4. System automatically deducts ingredients

#### Viewing Analytics
1. Check **Analytics** for historical data
2. Use **Reports** for detailed analysis with calendar
3. Review **Predictions** for AI-powered forecasts
4. Monitor **Kitchen Dashboard** for preparation tasks

#### System Settings
1. Go to **Settings**
2. Toggle **Dark Mode** under General
3. Configure notifications and sync intervals
4. Manage data import/export

## API Endpoints

### Dishes
- `GET /api/dishes` - Get all dishes
- `POST /api/dishes` - Create new dish
- `PUT /api/dishes/{id}` - Update dish
- `DELETE /api/dishes/{id}` - Delete dish

### Ingredients
- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Create ingredient
- `PUT /api/ingredients/{id}/quantity` - Update quantity

### Orders
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order

### Analytics
- `GET /api/analytics/sales` - Get sales data
- `GET /api/analytics/daily-sales` - Get daily breakdown

### Predictions
- `GET /api/predictions` - Get predictions
- `POST /api/predictions/generate` - Generate new predictions

### System
- `POST /api/sync` - Manual sync
- `GET /api/sync/status` - Sync status
- `GET /health` - Health check

## Database Schema

The system uses SQLite with the following main tables:

- **dishes** - Menu items with pricing and categories
- **ingredients** - Inventory items with quantities
- **dish_ingredients** - Relationship with sub-ingredient data (JSON)
- **orders** - Customer orders
- **order_items** - Order line items
- **predictions** - ML-generated forecasts
- **inventory_transactions** - Stock movement history
- **sync_log** - System synchronization logs

## Machine Learning

The system uses **Meta's Prophet** for demand forecasting:

- **Historical Analysis**: Analyzes past 60 days of order data
- **Seasonal Patterns**: Detects weekly and daily seasonality
- **External Factors**: Considers day of week, month, and weekend effects
- **Confidence Intervals**: Provides prediction confidence scores
- **Multi-period Forecasting**: Generates predictions for morning, afternoon, and evening

### Prediction Factors
- Historical order patterns
- Day of week effects
- Seasonal trends
- Weekend vs weekday differences
- Recent demand changes

## Development

### Project Structure
\`\`\`
restaurant-management-system/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                   # Utilities and stores
├── backend/               # FastAPI backend
│   ├── main.py           # FastAPI app
│   ├── database.py       # Database operations
│   ├── models.py         # Pydantic models
│   ├── ml_predictions.py # Prophet ML engine
│   └── sync_service.py   # Auto-sync service
└── README.md
\`\`\`

### Adding New Features

1. **Backend**: Add endpoints in `main.py`, update database schema in `database.py`
2. **Frontend**: Create components, update API calls in `lib/api.ts`
3. **ML**: Extend prediction logic in `ml_predictions.py`

### Environment Variables

Create `.env.local` for frontend:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:8000
\`\`\`

## Deployment

### Backend Deployment
1. Set up Python environment on server
2. Install dependencies: `pip install -r requirements.txt`
3. Configure database path and environment variables
4. Run with production ASGI server: `gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app`

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or any hosting platform
3. Set environment variables for API URL

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Python version (3.8+ required)
   - Ensure virtual environment is activated
   - Install Prophet dependencies: `pip install prophet`

2. **Frontend API errors**
   - Verify backend is running on port 8000
   - Check CORS settings in FastAPI
   - Confirm API_BASE_URL in frontend

3. **Prophet installation issues**
   - Install with conda: `conda install -c conda-forge prophet`
   - Or use pip with dependencies: `pip install prophet`

4. **Database errors**
   - Check SQLite file permissions
   - Ensure database directory exists
   - Run database initialization script

### Performance Tips

- Enable gzip compression for API responses
- Use database indexing for large datasets
- Implement Redis caching for frequently accessed data
- Monitor Prophet model training performance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review API documentation at `http://localhost:8000/docs`
