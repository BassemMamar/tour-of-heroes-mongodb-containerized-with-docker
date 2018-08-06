FROM node:latest
WORKDIR /server/app
COPY package.json package.json
RUN npm install
COPY . .
ENTRYPOINT [ "node", "app.js"]   
EXPOSE 3333