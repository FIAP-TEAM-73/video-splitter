FROM public.ecr.aws/lambda/nodejs:22

# ENV DEBUG="puppeteer:*"

# Copy the FFmpeg binary to /usr/bin
COPY bin /usr/bin

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . ./

RUN npm run build

WORKDIR /var/task

# Set Lambda handler
ENTRYPOINT ["/lambda-entrypoint.sh"]