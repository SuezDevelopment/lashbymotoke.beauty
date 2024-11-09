ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# RUN npm install -g next

COPY . .

RUN npm run build

CMD ["npm", "start"]
