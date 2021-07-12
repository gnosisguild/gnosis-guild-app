import { Ed25519Provider } from "key-did-provider-ed25519";
import { DID } from "dids";
import KeyDidResolver from "key-did-resolver";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";
import Ceramic from "@ceramicnetwork/http-client";
import { Caip10Link } from "@ceramicnetwork/stream-caip10-link";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import { StreamID } from "@ceramicnetwork/streamid";
import { IDX } from "@ceramicstudio/idx";
import { ethers } from "ethers";

import { parse } from "json2csv";

import CeramicClient from "@ceramicnetwork/http-client";

const graphqlRequest = require("graphql-request");
const fs = require("fs");

require("dotenv").config();

type Payment = {
  id: string;
  value: number;
};
type Contributor = {
  id: string;
  owner: string;
  paymentHistory: Array<Payment>;
};

type LastRun = {
  lastGuildID: string;
  lastContributorID: string;
};

const SUBGRAPH_URL = process.env.SUBGRAPH_URL;
let lastGuildID = "";
let lastContributorID = "";
const DATE = Date.now().toString().substr(0, 10);

const fetchGuilds = async () => {
  const fetchGuildQuery = graphqlRequest.gql`
      query getGuildByOwner($lastID: String) {
				guilds(first: ${BATCH_SIZE} where: { id_gt: $lastID, active: true }) {
          id
					tokenAddress
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

const fetchContributors = async (
  guild: string
): Promise<Array<Contributor>> => {
  const fetchContributors = graphqlRequest.gql`
	    query getContributors($lastID: String, $date: String, $guild: String) {
				guildSubscriptions(first: ${BATCH_SIZE}, where: { id_gt: $lastID, expires_gte: $date, guild: $guild, active: true }) {
					id,
          owner
					paymentHistory {
					  id
						value
					}
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
  const ceramic = new Ceramic(process.env.CERAMIC_URL);
  const resolver = {
    ...KeyDidResolver.getResolver(),
    ...ThreeIdResolver.getResolver(ceramic),
  };
  const seed = process.env.NODE_WALLET_SEED?.split(",");
  if (!seed) {
    console.error("NODE_WALLET_SEED is missing");
    return ceramic;
  }

  const provider = new Ed25519Provider(new Uint8Array(seed.map(Number)));
  const did = new DID({ resolver });
  ceramic.setDID(did);
  ceramic?.did?.setProvider(provider);
  await ceramic?.did?.authenticate();
  return ceramic;
};

// Convert id to did
const ethAddressToDID = async (address: string, ceramic: CeramicClient) => {
  const link = await Caip10Link.fromAccount(
    ceramic,
    ethers.utils.getAddress(address) + `@eip155:${process.env.NETWORK_ID}`
  );
  return link.did;
};

const fileHandler = (err: Error) => {
  if (err) {
    return console.error(err);
  }
};

const updateLastRun = async (
  lastGuildID: string,
  lastContributorID: string
) => {
  await fs.truncate("./last_run.json", 0, () => {
    fs.writeFileSync(
      "./last_run.json",
      JSON.stringify({ lastContributorID, lastGuildID }),
      fileHandler
    );
  });
};

const main = async () => {
  const ceramic = await setupCeramic();
  const aliases = {
    contributorProfile:
      "kjzl6cwe1jw14946qcgwbeixkh2ou9hwn29zv331akhfr61a44klf9ukg9jxz8g",
    contributorCSV:
      "kjzl6cwe1jw14agavukkr2w9qtay6eaxddurgvelnrnf7m74z1s2hofxp15dfea",
    guildCSVMapping:
      "kjzl6cwe1jw148kqr4ie3icw225t9d8dvupd6rtl0h8ringvw7evmjr5mgf626t",
  };
  const idx = new IDX({ ceramic, aliases });
  let data = "";
  try {
    let data = fs
      .readFileSync("./last_run.json")
      .catch((err: Error) => console.log(err));
  } catch {
    data = "";
  }
  if (data) {
    const deserializedData = JSON.parse(data) as LastRun;
    lastContributorID = deserializedData.lastContributorID;
    lastGuildID = deserializedData.lastGuildID;
  } else {
    console.warn("No last_run file");
  }

  const guilds = await fetchGuilds();
  let contributors = [];
  for (const guild of guilds) {
    contributors = [];
    // get contributors from subgraph
    const activeContributors = await fetchContributors(guild.id);
    for (const contributor of activeContributors) {
      const did = await ethAddressToDID(contributor.owner, ceramic);
      // Ignore and work with working cid
      if (!did) {
        console.error(`Missing did for contributor ${contributor.owner}`);
        continue;
      }
      const encryptedProfile = (await idx.get("contributorProfile", did)) as {
        profile: any;
      };
      // Add and construnct CSV
      if (encryptedProfile && contributor.paymentHistory.length > 0) {
        const profile = await ceramic.did?.decryptDagJWE(
          encryptedProfile.profile
        );
        // Dai is defaulted to
        let paymentAmount = contributor.paymentHistory[0].value.toString();
        let currency = "DAI";
        if (guild.tokenAddress === ethers.constants.AddressZero) {
          paymentAmount = ethers.utils.formatEther(paymentAmount);
          currency = "ETH";
        }
        contributors.push({
          name: profile?.name,
          email: profile?.email,
          address: profile?.address,
          amount: paymentAmount,
          currency: currency,
        });
      }

      lastContributorID = contributor.id;

      await updateLastRun(lastGuildID, lastContributorID);
      console.log(
        `Contributor ${contributor.id} has been added to guild ${guild.id}`
      );
    }
    if (contributors.length > 0 && ceramic.did) {
      const csv = parse(contributors);
      const encryptedCSV = await ceramic.did?.createDagJWE({ csvString: csv }, [
        ceramic.did?.id,
      ]);

      const record = await TileDocument.create(
        ceramic,
        { csv: encryptedCSV },
        {
          controllers: [ceramic.did?.id],
          family: "ContributorCSV",
          schema:
            "ceramic://k3y52l7qbv1frxli9be7tgqhymexl50ah5xgdfkltu2skoqrjpp4kgat5v9qif9q8",
        }
      );
      await ceramic.pin.add(record.id);
      const merged = await idx.merge("guildCSVMapping", {
        [`${guild.id}:${process.env.NETWORK_ID}`]: record.id.toString(),
      });
      await ceramic.pin.add(merged);
    }

    lastGuildID = guild.id;
    await updateLastRun(lastGuildID, "");

    console.log(`Guild ${guild.id} processed`);
  }

  await updateLastRun("", "");
  console.log(`Job has completed`);
};

main();
