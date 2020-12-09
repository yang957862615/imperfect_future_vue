FROM node:alpine

RUN mkdir -p /app/src
COPY ./src /app/src
WORKDIR /app/src

ENV HOST "0.0.0.0"

RUN sed -i "s/dl-cdn.alpinelinux.org/${ALPINE_REPOSITORIES}/g" /etc/apk/repositories

RUN apk add --no-cache make gcc g++ python

RUN npm config set registry https://registry.npm.taobao.org
RUN npm install
RUN npm run build
RUN npm cache clean --force

RUN apk del make gcc g++ python

EXPOSE 8080
CMD ["npm", "start"]
