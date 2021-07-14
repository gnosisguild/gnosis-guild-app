# Gnosis Guild Safe App

An application with two user profiles a guild contributor and a guild owner. A guild is a method for a content creating organization to receive recurring revenue. The guild owner side of the application is a safe app that allows members of a Gnosis safe to create a guild. This guild will allow contributors to learn a little about the guild and contribute via the Gnosis CPK on a 30 day interval. The contributor form is not a safe app, but a standard React app.

## Installation

Run the following commmand:

```
yarn install
```

## Getting Started

### Local Development

When developing locally there are two pieces that need to be set up the react app and the express server. Both of these can be set up with the below commands.

React app:

```
npm run start
```

Express:

```
npm run serve-dev
```

### Production Deployment

We provided a Dockerfile for deployment purposes. We recommend modifying the Dockerfile to be a two step build if it will be used in a production setting. Building the app outside of Docker we recommend the below commands.

```
yarn run serve
```

### Env vars

#### Client Environment variables

- _REACT_APP_INFURA_ID_: The infura client id for the guild app
- _REACT_APP_API_HOST_: The server uri
- _REACT_APP_DOMAIN_: The url of the app
- _REACT_APP_USE_CPK_: Whether to use the CPK or not
- _REACT_APP_CERAMIC_URL_: URL of ceramic netwrork to use, used in both the client and server

#### Server Environment variables

- _NFT_STORAGE_: The api key for nft.storage
- _SERVER_PORT_: port the server listens to
- _SCHEMA_DID_: local did used generate ceramic schemas
- _NODE_WALLET_SEED_: byte array used for the wallet seed needed to read the encrypted user data and generated with the below code.

```
const random = require('@stablelib/random')
var seed = random.randomBytes(32)
```

### Components

#### Server

The server is an express app, uses NFT storage to store the guild metadata, and Ceramic in order to fetch the created guild CSV. The Ceramic document is a mapping of guild id to csv cid, and is created in the [contributor-list-job](./packages/contributor-list-job/README.md). More information can be found there.

#### React App

There are 4 main pages to the React App.

1. Guild App page
   - This page holds all the safe app views, handles creating, updating, deleting a guild, and downloading a guilds contributor CSV.
1. Guild Landing Page
   - The landing page for a contributor to contribute to the guild.
1. Contributor page
   - A page for a contributor to contribute, and cancel their contribution.
1. Contributor Link Page
   - Holds the same functionality as the contributor page, but is meant to be wrapped in an Iframe and thus has a slightly different layout.

## Commands

**yarn run start**: Start the react app
**yarn run build**: Create optimized static files for the React app
**serve-dev**: Start the Express server
**serve**: Build and then start the Express server
**lint**: Lint the app
**deploy-schema**: Run the schema deploy script which will log the ceramic uri and add them to the Ceramic network

## Generating Ceramic Schemas

1. Install the [idx cli](https://www.npmjs.com/package/@ceramicstudio/idx-cli)
1. Create a did `idx did:create`
1. Create idx definition
   - Command: `idx definition:cerate`
   - Example
     - `idx definition:create did:key:z6MkvVDYv8tb sHt71thPou827LLnHGjgjtMQSeUUBRE6pYAD --schema="ceramic://k3y52l7qbv1fry10q0pvzj8rw tiwik6jrla51zyn1whgnz1s5sf2rs05gupuqoagw" --name="contributorProfile" --descriptio n="Profile for contributing to Gnosis guilds"`
1. Update definition did aliases in the application

## Adding a network
