ARG NODE_VERSION
FROM node:${NODE_VERSION}

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --include=optional sharp

# RUN npm install -g next

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
