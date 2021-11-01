FROM node:alpine

WORKDIR /app

COPY ./package.json /app/

COPY services/gatherkeywords/ /app/

RUN npm install

ENTRYPOINT node index.js