FROM node:20 AS base

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

#dev

RUN npm run build
FROM base AS dev
CMD ["npm", "run", "dev"]

RUN npm run build
FROM base AS stage
CMD ["npm", "run", "stage"]

RUN npm run build
FROM base AS prod
CMD ["npm", "run", "prod"]