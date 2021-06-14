const didProvider = require("key-did-provider-ed25519");
const graphqlRequest = require("graphql-request");
const ceramicClient = require("@ceramicnetwork/http-client").default;
const keyResolver = require("key-did-resolver").default;
const threeIdResolver = require("@ceramicnetwork/3id-did-resolver").default;
const dids = require("dids");

const ethers = require("ethers");
require("dotenv").config();

// fetch all the guilds
// then process each guild one by one
// TODO: Move to a separate package

const BATCH_SIZE = 100;
const SUBGRAPH_URL = process.env.SUBGRAPH_URL;
const NETWORK = process.env.NETWORK;
// These should be read from a local file
let lastGuildID = "";
let lastContributorID = "";
const DATE = Date.now().toString();

const fetchGuilds = async () => {
  const fetchGuildQuery = graphqlRequest.gql`
      query getGuildByOwner($lastID: String) {
				guilds(first: ${BATCH_SIZE} where: { id_gt: $lastID, active: true }) {
          id
      }
		}
    `;
  try {
    const resp = await graphqlRequest.request(SUBGRAPH_URL, fetchGuildQuery, {
      lastID: lastGuildID
    });
    if (resp && resp.guilds && resp.guilds.length > 0) {
      return resp.guilds;
    }
  } catch (err) {
    console.error(`Failed to fetch Guilds: ${err}`);
  }
  return [];
};

const fetchContributors = async () => {
  // TODO: Should expires be same day
  const fetchContributors = graphqlRequest.gql`
	    query getContributors($lastID: String, $date: String) {
				guildSubscriptions(first: ${BATCH_SIZE}, where: { id_gt: $lastID, expires_gte: $date }) {
          owner
      }
		}
	`;
  try {
    const resp = await graphqlRequest.request(SUBGRAPH_URL, fetchContributors, {
      lastID: lastContributorID,
      date: DATE
    });
    if (resp && resp.guildSubscriptions && resp.guildSubscriptions > 0) {
      return resp.guildSubscriptions;
    }
  } catch (err) {
    console.error(`Failed to fetch guild subscriptions: ${err}`);
  }
  return [];
};

const setupCeramic = async () => {
  const ceramic = new ceramicClient("https://ceramic-clay.3boxlabs.com");
  const resolver = {
    ...keyResolver.getResolver(),
    ...threeIdResolver.getResolver(ceramic)
  };
  const seed = process.env.NODE_WALLET_SEED.split(",");

  const provider = new didProvider.Ed25519Provider(seed);
  const did = new dids.DID({ resolver });
  console.log(did);
  ceramic.setDID(did);
  ceramic.did.setProvider(provider);
  await ceramic.did.authenticate();
  return ceramic;
};

const main = async () => {
  const ceramic = setupCeramic();
  const guilds = await fetchGuilds();
  for (const guild of guilds) {
    const contributors = {};
    // get contributors from subgraph
    const activeContributors = await fetchContributors();
    for (const contributor of activeContributors) {
      console.log("Fetch profile from Ceramic");
      // Create seed with random uint
      // change that seed to a string to make repeatable
      // split on comma to recreate and to use on the server
      // use key-did-provider, alhtough this does not provide
      // rotations I should be unblocked
      // with all this I can probably store and decrypt stuff on the backend
    }
  }

  // update last guild id
  // upate last contributor id
};

main();
