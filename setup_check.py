#!/usr/bin/env python
"""Quick setup and status checker for the Graph Search system."""

import os
import subprocess
import sys
import time

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def print_success(text):
    print(f"✓ {text}")

def print_error(text):
    print(f"✗ {text}")

def print_info(text):
    print(f"ℹ {text}")

def check_python():
    """Check if Python and required packages are installed."""
    print_header("Checking Python Environment")
    try:
        import fastapi
        print_success("FastAPI installed")
    except ImportError:
        print_error("FastAPI not installed. Run: pip install fastapi uvicorn")
        return False
    
    try:
        import uvicorn
        print_success("Uvicorn installed")
    except ImportError:
        print_error("Uvicorn not installed. Run: pip install uvicorn")
        return False
    
    return True

def check_node():
    """Check if Node.js and npm are installed."""
    print_header("Checking Node.js Environment")
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print_success(f"Node.js installed: {result.stdout.strip()}")
        else:
            print_error("Node.js not found. Install from nodejs.org")
            return False
    except Exception as e:
        print_error(f"Error checking Node.js: {e}")
        return False
    
    try:
        result = subprocess.run(
            ["npm", "--version"],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print_success(f"npm installed: {result.stdout.strip()}")
        else:
            print_error("npm not found")
            return False
    except Exception as e:
        print_error(f"Error checking npm: {e}")
        return False
    
    return True

def check_data_files():
    """Check if required data files exist."""
    print_header("Checking Data Files")
    
    required_files = [
        ("algoritmo.py", "Graph algorithm implementation"),
        ("api.py", "FastAPI server"),
        ("cidades_mt.csv", "City data"),
        ("frontend/package.json", "Frontend dependencies"),
    ]
    
    all_exist = True
    for filename, description in required_files:
        if os.path.exists(filename):
            print_success(f"{filename} - {description}")
        else:
            print_error(f"{filename} - {description} (NOT FOUND)")
            all_exist = False
    
    return all_exist

def print_instructions():
    """Print setup and running instructions."""
    print_header("Setup Instructions")
    
    print("\n1. Install Frontend Dependencies (one time):")
    print("   cd frontend")
    print("   npm install")
    
    print("\n2. Start Backend (Terminal 1):")
    print("   python api.py")
    print("   Backend will be available at: http://127.0.0.1:8000")
    
    print("\n3. Start Frontend (Terminal 2):")
    print("   cd frontend")
    print("   npm run dev")
    print("   Frontend will be available at: http://localhost:3000")
    
    print("\n4. Access the Application:")
    print("   API: http://127.0.0.1:8000")
    print("   API Docs: http://127.0.0.1:8000/docs")
    print("   Frontend: http://localhost:3000")

def main():
    print("\n" + "🗺️  GRAPH SEARCH VISUALIZATION SYSTEM - SETUP CHECKER".center(60))
    
    python_ok = check_python()
    node_ok = check_node()
    files_ok = check_data_files()
    
    print_header("Summary")
    
    if python_ok and node_ok and files_ok:
        print_success("All requirements met!")
        print_instructions()
    else:
        print_error("Some requirements are missing. Please install them above.")
        if not python_ok:
            print_info("Python packages: pip install fastapi uvicorn pydantic python-multipart")
        if not node_ok:
            print_info("Node.js: Download from https://nodejs.org/")
        sys.exit(1)

if __name__ == "__main__":
    main()
