#!/bin/sh

# Stop all running containers
docker stop $(docker ps -a -q)

# License key for Elastic
curl -fsSL https://elastic.co/start-local | sh

# Read the API key from elastic-start-local/.env
ES_API_KEY=$(grep "ES_LOCAL_API_KEY" elastic-start-local/.env | cut -d '=' -f2)

# Update the .env files with the API key
echo "\nELASTIC_API_KEY=$ES_API_KEY" >> .env.development
echo "\nELASTIC_API_KEY=$ES_API_KEY" >> .env.test

# Start the containers
docker compose up -d

# Wait for the containers to start
sleep 5

# Create the index
curl -X PUT "http://localhost:9200/benefits" \
-H "Content-Type: application/json" \
-H "Authorization: ApiKey $ES_API_KEY" \
-d '{
  "settings": {},
  "mappings": {}
}'

# Start the backend
npm run start:dev