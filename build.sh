#!/bin/bash

# Exit on error
set -e

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 255430796412.dkr.ecr.us-east-1.amazonaws.com

docker build -t andersonacdm/tech-challenge73 .  --platform=linux/amd64
docker tag andersonacdm/tech-challenge73:latest 255430796412.dkr.ecr.us-east-1.amazonaws.com/andersonacdm/tech-challenge73:latest
docker push 255430796412.dkr.ecr.us-east-1.amazonaws.com/andersonacdm/tech-challenge73:latest