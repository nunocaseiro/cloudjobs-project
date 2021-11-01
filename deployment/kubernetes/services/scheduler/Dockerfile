FROM node:alpine

WORKDIR /app

COPY ./package.json /app/

COPY services/scheduler/ /app/

RUN npm install

ENTRYPOINT node index.js