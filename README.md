# NestJS PoC

## Introduction

This is a proof of concept on how to use NestJS framework to create a microservices graphql API using NATs as a service mesh.

This repository is made up of three NestJS projects located inside the `packages` directory. These are:

- Users micro service
- Posts micro service
- Gateway

Our API supports two queries `users` & `posts`. As you can imagine posts are created by users, and therefor, users can have many posts created and each post can have one author represented by a user.

- When we call the `users` query the users resolver will use the service mesh to get the posts of each user from the `posts` micro service
- When we call the `posts` query the posts resolver will use the service mesh to get get the author user of each post from the `users` micro service.

Because both microservices expose a different graphql server, we need one last peace that join both APIs into one single endpoint that exposes the full graphql schema, this is the gateway project. The gateway only contains the configuration to create a super graph based on the microservices sub graph

## Run the PoC

To run the PoC

1. `yarn install`

2. Run the Nats Container `docker-compose up`

3. now, open three terminals and run these three commands, be sure to run the last one (the gateway) after the two microservices are up and running:

   - `yarn run users`
   - `yarn run posts`
   - `yarn run gw`

4. Go to the gateway's playground to test the queries in `https://localhost:3000/graphql`
