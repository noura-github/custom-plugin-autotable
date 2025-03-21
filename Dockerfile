FROM python:3.12-slim

WORKDIR /app
COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

# Install nginx
RUN apt-get update && apt-get install -y nginx && \
    rm -rf /var/lib/apt/lists/*

# Remove default NGINX site
RUN rm /etc/nginx/sites-enabled/default

COPY nginx.conf /etc/nginx/nginx.conf
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]

