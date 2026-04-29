import os
import sys

# Add the root directory to the path so we can import src and main
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from main import handler

# Netlify expects the function to be exported as 'handler'
# Mangum already provides this in our main.py
