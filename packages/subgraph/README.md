# GuildApp Subgraph

Subgraph for the Gnosis GuildApp

## Installation

```
yarn install
```

## Deployment instructions

1. Update [subgraph.yaml](subgraph.yaml): Open [config.js](manifests/config.json) and make sure `GuildFactory` contract address and deployment block No. are specified and up-to-date for the network you want the subgraph to be (re-)deployed. Then run the following command:

```
yarn prepare <network name>
```

2. If contracts ABI are updated at some point, you nedd to execute the following command:

```
yarn codegen
```

3. To Make sure all the mapping compile successfully:

```
yarn build
```

4. Finally, to (Re-)Deploy the subgraph:

```
yarn deploy-*
```

where `*` stands for the network name (i.e. rinkeby, main, xdai, matic) you want to deploy the subgraph.

# LICENSE

[MIT](LICENSE)
