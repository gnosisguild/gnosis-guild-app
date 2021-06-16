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

// fetch all the guilds
// then process each guild one by one
// TODO: Move to a separate package

const BATCH_SIZE = 100;
const SUBGRAPH_URL = process.env.SUBGRAPH_URL;
const NETWORK = process.env.NETWORK;
// These should be read from a local file
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
	console.log(guild)
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
  console.log(ceramic);
  const resolver = {
    ...KeyDidResolver.getResolver(),
    ...ThreeIdResolver.getResolver(ceramic),
  };
  const seed = process.env.NODE_WALLET_SEED.split(",");

  const provider = new Ed25519Provider(new Uint8Array(seed.map(Number)));
  const did = new DID({ resolver });
  console.log(did);
  ceramic.setDID(did);
  ceramic.did.setProvider(provider);
  await ceramic.did.authenticate();
  return ceramic;
};

// Convert id to did
const ethAddressToDID = async (address, ceramic) => {
	console.log(address)
	const link = await Caip10Link.fromAccount(ceramic, address+'@eip155:1' )
	console.log(link)
	// console.log(link.did)
	// console.log(link.did._id)
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
      console.log("Fetch profile from Ceramic");
      console.log(contributor);
      const did = await ethAddressToDID(contributor.owner, ceramic);
      console.log(did);
			// const profile = await idx.get("contributorProfile", contributor.owner.toLowerCase()+'@eip155:1')
			// Ignore and work with working cid
			const profile = await idx.get("contributorProfile", 'did:3:kjzl6cwe1jw146kdpi7tdxw3tl7i9dj7sfyzwbsmo62xij83sf870aln9qecfym')
			console.log(profile)
			// Add and construnct CSV
			contributors.push({"name": profile.name, "email": profile.email, "address": profile.address})
				

      // Create seed with random uint
      // change that seed to a string to make repeatable
      // split on comma to recreate and to use on the server
      // use key-did-provider, alhtough this does not provide
      // rotations I should be unblocked
      // with all this I can probably store and decrypt stuff on the backend
      //
      // download example app convert addresses to dids and then fetch profiles
    }
		// create CSV and store
		console.log(contributors)
		if (contributors.length > 0) {
		  const csv = parse(contributors);
		  console.log(csv)
			const record =  await idx.set("contributorCSV", {"csv": csv})
			await ceramic.pin.add(record)
			console.log("Record")
			console.log(record.cid.toString())
			// Store in ceramic
			const merged = await idx.merge("guildCSVMapping", {[guild.id]: record.cid.toString()})
			await ceramic.pin.add(merged)
			console.log(merged)

		}
  }


  // update last guild id
  // upate last contributor id
};

main();
