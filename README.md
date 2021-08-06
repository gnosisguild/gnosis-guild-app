# Gnosis Guild App Monorepo

## Packages

| name                 | description                                       | readme                                            |
| -------------------- | ------------------------------------------------- | --------------------------------------------------|
| gnosis-guild-app     | GuildApp SafeApp & embeddable plugin | [link]('./packages/gnosis-guild-app/README.md') |
| contracts            | GuildApp smart contracts | [link](./packages/contracts/README.md) |
| subgraph             | GuildApp subgraph | [link](./packages/subgraph/README.md) |
| contributor-list-job | A job to build a contributor CSV per guild | [link](./packages/contributor-list-job/README.md) |
| subscription-relayer | A standalone relayer server to demo how to collect Guild subscriptions from Safes using the AllowanceModule | [link](./packages/relayer-server/README.md) |


## Installation

```
yarn install
```

## Adding a new network

1. Deploy Contracts on the desired network
1. Deploy the subgraph on the specified network
1. Add a new config to networks.ts inside of gnosis-guild-app
1. Deploy another version of the contributor-job-list with the new networks configuration.

# License

[MIT](LICENSE)
