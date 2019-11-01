FROM node:10

# Create work dir
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install


COPY . .

EXPOSE 3000

CMD["yarn", "start"]