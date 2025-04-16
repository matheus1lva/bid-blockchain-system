FROM node:20-alpine

WORKDIR /app

# Copy package.json and yarn.lock
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy the rest of the code
COPY . .

# Generate Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["yarn", "dev"] 