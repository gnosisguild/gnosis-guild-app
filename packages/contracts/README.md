# GuildApp Contracts

Guild App Smart Contracts

## Overview

This hardhat project implements the following smart contracts:

* **GuildApp.sol**: Guild app allows you to monetize content and receive recurring subscriptions form EOA accounts and Gnosis Safe Proxy contract accounts with the [AllowanceModule](https://github.com/gnosis/safe-modules/tree/master/allowances) enabled. It is based on the ERC721 standard to tokenize subscriptions.
* **GuildFactory.sol**: implements the EIP-1167 proxy pattern to act as a factory for new GuildApp contracts

## Installation

For using this project, uou need NodeJS>=12.x.x and Yarn>=1.x

```
yarn install
yarn build
```

## Deployment instructions

```
yarn deploy --network <network_name>
```

## Running tests

* Unit tests can be run using the following command

```
yarn test
```

* For running integration tests with Gnosis CPK, you'll need to deploy the contracts on Rinkeby first, and then run the following commands:

```
# It deploys a Test GuildApp
yarn run --network rinkeby scripts/generate-guilds.js
# Copy the new GuildApp contract address printed on the terminal and set it to `GUILD` variable on `scripts/test-subscriptions.js`
yarn run --network rinkeby scripts/test-subscriptions.js
```

* At the end, you'll have a Guild with subscriptions from two different Gnosis Safe. This is also useful for testing the recurring subscriptions using the [subscription-relayer server](../subscription-relayer)

## Deployed contract addresses

* You can find the addresses of the latest version of the contracts at [addresses.json](addresses.json)
