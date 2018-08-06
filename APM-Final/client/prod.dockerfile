##### Stage1
FROM node:alpine as node-stage
WORKDIR /app
COPY package.json package.json
RUN npm install
COPY . .
RUN npm run build -- --prod

##### Stage2
FROM nginx:alpine
WORKDIR /public
COPY --from=node-stage /app/dist /usr/share/nginx/html
COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf

# docker build -t client-instance-standalone -f prod.dockerfile .
# docker run -p 8080:80 client-instance-standalone