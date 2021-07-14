# `contributor-list-job`

A job that fetches all of the contributors to all guilds
for a specific network and then builds a CSV which is stored
on Ceramic.

## Installation

```
yarn install
```

## Getting Started

In order to run the job execute the below command.

```
yarn run start
```

### Production Deployment

This job is scoped per chain. Multiple versions of this job will need to be deployed in order to support multiple chains. Each job will have a slightly different config consisting of a different network id and different subgraph url.

## Environment Variables

SUBGRAPH_URL: the url to the chains specific subgraph
NODE_WALLET_SEED: A wallet seed that should match the wallet seed in the express server.

## Schema Updates

When Ceramic schemas are updated the dids need to be updated inside of the ceramic aliases.
