FROM node:lts-alpine
WORKDIR /usr/src/app
COPY bGames-APIrestGETService/package*.json ./
RUN npm install
COPY bGames-APIrestGETService ./
RUN ls -l
CMD ["npm", "run", "prod"]