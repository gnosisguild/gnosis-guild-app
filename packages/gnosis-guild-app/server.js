const express = require("express");
const path = require("path");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

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
