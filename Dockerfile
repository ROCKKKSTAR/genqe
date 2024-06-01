#stage 1
FROM node:16-alpine as genqe-angular-app
WORKDIR /app
COPY . .
RUN npm install --force
RUN npm run build

# # docker build . -t lms-angular
# # docker run -p 80:80 --name lms-ppg-angular lms-angular

#stage 2
#FROM nginx:1.23.3-alpine-slim
#COPY /mynginx.conf  /etc/nginx/conf.d/default.conf
#COPY --from=ppg-angular-app /app/dist/ppg-angular /usr/share/nginx/html
#EXPOSE 80
#STOPSIGNAL SIGQUIT
#CMD ["nginx", "-g", "daemon off;"]

#stage 2
# FROM node:18-alpine3.14

WORKDIR /app/node
RUN npm install && npm cache clean --force

EXPOSE 4201
CMD [ "node", "app.js" ]