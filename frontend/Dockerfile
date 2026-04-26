FROM node:20-alpine

WORKDIR /app

COPY package.json ./
# We don't have package-lock.json yet, so we just run npm install
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
