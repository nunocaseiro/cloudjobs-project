FROM node:alpine

WORKDIR /app

COPY ./package.json /app/

COPY services/search/ /app/

RUN npm install

ENTRYPOINT node index.js