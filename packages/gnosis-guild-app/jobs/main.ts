import type { CeramicApi } from "@ceramicnetwork/common";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { DID } from "dids";
import KeyDidResolver from "key-did-resolver";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import Ceramic from "@ceramicnetwork/http-client";
import { Caip10Link } from "@ceramicnetwork/stream-caip10-link"
import { IDX } from '@ceramicstudio/idx'

import { parse } from 'json2csv';


const graphqlRequest = require("graphql-request");

require("dotenv").config();

// TODO: Move to a separate package
const BATCH_SIZE = 100;
const SUBGRAPH_URL = process.env.SUBGRAPH_URL;
const NETWORK = process.env.NETWORK;
let lastGuildID = "";
let lastContributorID = "";
const DATE = Date.now().toString().substr(0, 10);

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
      lastID: lastGuildID,
    });
    if (resp && resp.guilds && resp.guilds.length > 0) {
      return resp.guilds;
    }
  } catch (err) {
    console.error(`Failed to fetch Guilds: ${err}`);
  }
  return [];
};

const fetchContributors = async (guild: string) => {
  // TODO: Should expires be same day
  const fetchContributors = graphqlRequest.gql`
	    query getContributors($lastID: String, $date: String, $guild: String) {
				guildSubscriptions(first: ${BATCH_SIZE}, where: { id_gt: $lastID, expires_gte: $date, guild: $guild }) {
					id,
          owner
      }
		}
	`;
  try {
    const resp = await graphqlRequest.request(SUBGRAPH_URL, fetchContributors, {
      lastID: lastContributorID,
      date: DATE,
			guild: guild,
    });
    if (resp && resp.guildSubscriptions && resp.guildSubscriptions.length > 0) {
      return resp.guildSubscriptions;
    }
  } catch (err) {
    console.error(`Failed to fetch guild subscriptions: ${err}`);
  }
  return [];
};

const setupCeramic = async () => {
  const ceramic = new Ceramic(
    "https://ceramic-clay.3boxlabs.com"
  ) as CeramicApi;
  const resolver = {
    ...KeyDidResolver.getResolver(),
    ...ThreeIdResolver.getResolver(ceramic),
  };
  const seed = process.env.NODE_WALLET_SEED.split(",");

  const provider = new Ed25519Provider(new Uint8Array(seed.map(Number)));
  const did = new DID({ resolver });
  ceramic.setDID(did);
  ceramic.did.setProvider(provider);
  await ceramic.did.authenticate();
  return ceramic;
};

// Convert id to did
const ethAddressToDID = async (address, ceramic) => {
	const link = await Caip10Link.fromAccount(ceramic, address+'@eip155:1' )
	return link.did
};

const main = async () => {
  const ceramic = await setupCeramic();
		const aliases = {
			contributorProfile: "kjzl6cwe1jw147hrqhk7ho3awg5cf3l4x83y2e7l2thcemakdxv5eti8bwhklui",
			contributorCSV: "kjzl6cwe1jw1475xzl8f0zydr6dinz0akseglx7hja6a13na2l29hh65knps18b",
			guildCSVMapping: "kjzl6cwe1jw148kqr4ie3icw225t9d8dvupd6rtl0h8ringvw7evmjr5mgf626t"
		}
   const idx = new IDX({ ceramic, aliases })


  const guilds = await fetchGuilds();
  let contributors = [];
  for (const guild of guilds) {
		contributors = []
    // get contributors from subgraph
    const activeContributors = await fetchContributors(guild.id);
    for (const contributor of activeContributors) {
      const did = await ethAddressToDID(contributor.owner, ceramic);
			// Ignore and work with working cid
			const profile = await idx.get("contributorProfile", 'did:3:kjzl6cwe1jw146kdpi7tdxw3tl7i9dj7sfyzwbsmo62xij83sf870aln9qecfym')
			// Add and construnct CSV
			contributors.push({"name": profile.name, "email": profile.email, "address": profile.address})
    }
		if (contributors.length > 0) {
		  const csv = parse(contributors);
			const record =  await idx.set("contributorCSV", {"csv": csv})
			await ceramic.pin.add(record)
			const merged = await idx.merge("guildCSVMapping", {[guild.id]: record.cid.toString()})
			await ceramic.pin.add(merged)
		}
  }


  // update last guild id
  // upate last contributor id
};

main();
