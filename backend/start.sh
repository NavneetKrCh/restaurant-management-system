#!/bin/bash
# Quick start script for Restaurant Management System Backend

echo "Starting Restaurant Management System Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Please run setup.sh first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Start the server
python run.py
