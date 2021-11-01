FROM node:alpine

WORKDIR /app

RUN npm install --global nodemon

COPY ./package.json /app/

RUN npm install

CMD ["nodemon", "statistics/index.js" ]