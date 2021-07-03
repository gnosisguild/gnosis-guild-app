FROM node:14.17-buster-slim as react-build
WORKDIR app

COPY ./package.json /app/package.json

RUN apt-get update && apt-get -y install git

COPY ./yarn.lock /app/yarn.lock
RUN yarn install
COPY ./src /app/src

COPY ./tsconfig.json /app/tsconfig.json

EXPOSE 4000

CMD npm run start
