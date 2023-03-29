FROM node:14-alpine AS node

FROM node AS builder
WORKDIR /app            
COPY package*.json ./   
RUN npm i               
COPY . .                
RUN npm run build    
EXPOSE ${PORT}
ENTRYPOINT [ "npm", "run", "dev" ]

FROM node AS final
ENV NODE_ENV production
RUN apk --no-cache -U upgrade
RUN mkdir -p /home/node/app/dist && chown -R node:node /home/node/app
WORKDIR /home/node/app
RUN npm i -g pm2
COPY package*.json process.yml ./
USER node
RUN npm i --only=production
COPY --chown=node:node --from=builder /app/dist ./dist
EXPOSE ${PORT}
ENTRYPOINT ["pm2-runtime", "./process.yml"] 