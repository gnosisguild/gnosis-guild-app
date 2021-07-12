# Gnosis Guild App Monorepo

## Packages

|name| readme |
|gnosis-guild-app| [link]('./packages/gnosis-guild-app/README.md')
|contributor-list-job| [link](./packages/contributor-list-job/README.md)

## Installation

```
yarn install
```

## Adding a new network

1. Deploy Contracts on the desired network
1. Create a new subgraph
1. Add a new config to networks.ts inside of gnosis-guild-app
1. Deploy another version of the contributor-job-list with the new networks configuration.

# License

[MIT](LICENSE)
