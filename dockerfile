FROM node:10

# Create work dir
WORKDIR /usr/src/app

# Copy package.json &  package-lock.json first
# to prevent build of node modules if same
COPY package*.json ./

RUN yarn install

# Copy docker client directory to WORKDIR
COPY . .

EXPOSE 3000

# TINI allows SIGTERM SIGNALS to be registered
ENV TINI_VERSION v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

#SET the user as non-root
USER node

# Start Command
CMD ["node", "server.js"]