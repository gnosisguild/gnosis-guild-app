# `subscription-relayer`

A single relayer server to demo how to collect Guild subscriptions from Safes using the AllowanceModule.

## How it works

The server uses the guild-app subgraph to fetch those subscriptions whose last contribution expired. Then calls the `guild.subscribe` function on the GuildApp contract to renew the subscription. If subscriber used a Safe w/AllowanceModule, the tx will be processes if there's enough allowance (allowance.amount - allowance.spent) for the current allowance period.

## Installation

```
yarn install
```

## Getting Started

### Environment Variables

Copy the `.env.sample` file and rename it to `.env`

* JSON_RPC -> RPC Endpoint (i.e. Infura) 
* MNEMONIC -> Mnemonic phrase for the relayer server account (Account0 should have enough ETH to relay Txs)
* PORT -> Server port (default: 5000)
* SUBGRAPH_URL Guild App subgraph (default: https://api.thegraph.com/subgraphs/name/santteegt/gnosis-guild-app-rinkeby)

### Local Deployment

In order to deploy the server execute the command below.

```
yarn start
```

To trigger the relayer job, make a GET request to `http://localhost:5000`

## Future work

This module is just for demo purposes. In order to collect monthly subscriptions using a relayer in production, GuildApp should integrate with services lik GSN.

