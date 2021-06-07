const { NFTStorage, Blob } = require("nft.storage");
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
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
  contributions: "ETH"
};

var storage = multer.memoryStorage();
var upload = multer({ storage });

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(express.json()); // for parsing application/json
app.use(cors(corsOptions)); // for parsing application/json

// Add Endpoints to create metadata file
// Should take metadata object and return a URI

const getNFTStorageClient = () => {
  return new NFTStorage({ token: process.env.NFT_STORAGE });
};

app.post("/api/v1/guild", upload.single("image"), async (req, res) => {
  // Deserailize JSON
  const data = req.body;
  console.log("bidu");
  const client = getNFTStorageClient();
  // store image
  // console.log(req.file);
  // Remove exif data and other security mitigations
  let imageCid = "";
  if (req.file) {
    console.log("Image");
    console.log(req.file);
    imageCid = await client
      .storeBlob(req.file.buffer)
      .catch(err => console.error("Failed"));
    console.log(imageCid);
  }
  // Then store metadata]
  const metadata = {
    name: data.name,
    description: data.description,
    imageCid: imageCid || "",
    externalLink: data.externalLink,
    currency: data.currency,
    amount: data.amount,
    contentFormat: data.contentFormat
  };
  const metadataCid = await client
    .storeBlob(new Blob([Buffer.from(JSON.stringify(metadata))]))
    .catch(err => console.error(`Failed: ${err}`));
  console.log("Metadata");
  console.log(metadataCid);
  console.log(data);
  // Return metadata
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
