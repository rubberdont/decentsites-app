#!/bin/bash

cd "$(dirname "$0")/backend"

echo "Starting backend server..."
python main.py
