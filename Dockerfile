FROM node:lts-alpine
WORKDIR /usr/src/app
COPY bgames-apirestgetservice/package*.json ./
RUN npm install
COPY bgames-apirestgetservice ./
RUN ls -l
CMD ["npm", "run", "prod"]