#!/bin/bash

# Start Flask app in the background
python3 main.py &

# Start NGINX in the foreground
nginx -g 'daemon off;'
