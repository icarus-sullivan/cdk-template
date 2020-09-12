FROM node:12-alpine

WORKDIR home

COPY dist dist

RUN cd dist ; yarn install

EXPOSE 3000

CMD node dist/app.js
