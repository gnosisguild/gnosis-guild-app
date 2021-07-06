const { NFTStorage, Blob } = require("nft.storage");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const ed255199 = require("key-did-provider-ed25519");
const dids = require("dids");
const keyResolver = require("key-did-resolver").default;
const threeIdResolver = require("@ceramicnetwork/3id-did-resolver").default;
const Ceramic = require("@ceramicnetwork/http-client").default;
const ceramicIdx = require("@ceramicstudio/idx");
const streamTile = require("@ceramicnetwork/stream-tile");

require("dotenv").config();

const PORT = process.env.SERVER_PORT || 4000;

const app = express();

const exampleGuild = {
  name: "Other internet",
  description:
    "Other internet is an independent strategy and research group. Our process is different. We research, prototype, and execute new models for thinking about culture and technology. In doing so we've become responsible for the narrative ducts driving software, money, knowledge, media and culture.",
  contentFormat: "Early access to research essays and Discord community.",
  externalLink: "https://otherinter.net",
  image:
    "https://lh6.googleusercontent.com/TG1QkKg9QXRyobmLPoJW5Di6Wdl3bZ7eRDwPbWL-fevr1mtoyuHQkhbmVMOgvtUys43uw4H2-ikPyLfMo7S0tmypEyiCSMT1ToGu6aS1FZcskr8M8kwna3u3zgu46AIBPaS7ofYZ",
  contributions: "ETH",
};

var storage = multer.memoryStorage();
var upload = multer({ storage });

// TODO: Restrict to certain origins
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json()); // for parsing application/json
app.use(cors(corsOptions)); // for parsing application/json

const getNFTStorageClient = () => {
  return new NFTStorage({ token: process.env.NFT_STORAGE });
};

const ceramicAuth = async () => {
  const ceramic = new Ceramic("https://ceramic-clay.3boxlabs.com");
  const resolver = {
    ...keyResolver.getResolver(),
    ...threeIdResolver.getResolver(ceramic),
  };
  const seed = process.env.NODE_WALLET_SEED.split(",");

  const provider = new ed255199.Ed25519Provider(
    new Uint8Array(seed.map(Number))
  );
  const did = new dids.DID({ resolver });
  ceramic.setDID(did);
  ceramic.did.setProvider(provider);
  await ceramic.did.authenticate();
  return ceramic;
};

const idxSetup = (ceramic) => {
  const aliases = {
    contributorProfile:
      "kjzl6cwe1jw14946qcgwbeixkh2ou9hwn29zv331akhfr61a44klf9ukg9jxz8g",
    contributorCSV:
      "kjzl6cwe1jw14agavukkr2w9qtay6eaxddurgvelnrnf7m74z1s2hofxp15dfea",
    guildCSVMapping:
      "kjzl6cwe1jw148kqr4ie3icw225t9d8dvupd6rtl0h8ringvw7evmjr5mgf626t",
  };
  const idx = new ceramicIdx.IDX({ ceramic, aliases });
  return idx;
};

let CsvMapping;

const getGuildCsvMapping = async () => {
  const ceramicInst = await ceramicAuth();
  const idx = idxSetup(ceramicInst);
  const mapping = await idx.get("guildCSVMapping");
  if (!mapping) {
    console.error("No guild mapping available");
  }
  CsvMapping = mapping;
};

getGuildCsvMapping();
setInterval(function () {
  getGuildCsvMapping();
}, 3600000); // 1 hour

app.get("/api/v1/contributorList", async (req, res) => {
  const ceramicInst = await ceramicAuth();
  console.debug(`Incoming query string ${JSON.stringify(req.query)}`);

  const guildAddress = req.query.guildAddress;
  if (!guildAddress) {
    return;
  }
  const csvDid = CsvMapping[guildAddress];
  if (!csvDid) {
    res.attachment("contributors.csv");
    res.status(200).send("name,email,address,amount,currency");
    return;
  }
  // Does this work with multiple guilds
  const encryptedCsv = await streamTile.TileDocument.load(ceramicInst, csvDid);
  const csv = await ceramicInst.did?.decryptDagJWE(encryptedCsv.content.csv);

  // Write as temporary file and send
  res.attachment("contributors.csv");
  res.status(200).send(csv.csvString);
});

app.post("/api/v1/guild", upload.single("image"), async (req, res) => {
  const data = req.body;
  const client = getNFTStorageClient();
  // TODO: Remove exif data and other security mitigations
  let imageCid = "";
  if (req.file) {
    imageCid = await client
      .storeBlob(req.file.buffer)
      .catch((err) => console.error("Failed"));
  }
  const metadata = {
    name: data.name,
    description: data.description,
    imageCid: imageCid || "",
    externalLink: data.externalLink,
    currency: data.currency,
    amount: data.amount,
    contentFormat: data.contentFormat,
  };
  const metadataCid = await client
    .storeBlob(new Blob([Buffer.from(JSON.stringify(metadata))]))
    .catch((err) => console.error(`Failed: ${err}`));
  res.send({ metadataCid });
});

app.get("/", (req, res) => {
  const filePath = path.resolve(__dirname, "./build", "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return console.log(err);
    }

    data = data
      .replace(/__OG_TITLE__/g, "Gnosis Guild App")
      .replace(
        /__OG_DESCRIPTION__/g,
        "The Guild App is a permissionless subsription tool"
      )
      .replace(/__OG_IMAGE__/g, "");

    res.send(data);
  });
});

app.get("/guild/*", (req, res) => {
  const filePath = path.resolve(__dirname, "./build", "index.html");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return console.log(err);
    }

    data = data
      .replace(/__OG_TITLE__/g, `Guild: ${exampleGuild.name} is creating.`)
      .replace(
        /__OG_DESCRIPTION__/g,
        `Contribute to ${exampleGuild.name} using crypto today.`
      )
      .replace(/__OG_IMAGE__/g, exampleGuild.image);

    res.send(data);
  });
});

app.use(express.static(path.resolve(__dirname, "./build")));

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
