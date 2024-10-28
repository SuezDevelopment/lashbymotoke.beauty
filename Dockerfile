ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /app

COPY package.json package-lock.json ./

COPY . .

# Build your app
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
