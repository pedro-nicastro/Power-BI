#!/bin/sh
pip install -r requirements.txt
(sleep 2; python3 -m webbrowser http://127.0.0.1:5000) &
python3 app.py
