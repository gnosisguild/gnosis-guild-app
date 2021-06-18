const contributorSchema = require("../schemas/contributor");
const contributorCSVSchema = require("../schemas/contributor_csv");
const guildCSVMappingSchema = require("../schemas/guild_to_csv_mapping");
const { exec } = require("child_process");
const util = require("util");
const execP = util.promisify(exec);

require("dotenv").config();

const did = process.env.SCHEMA_DID;

const escapedContributorSchema = JSON.stringify(contributorSchema);
const escapedContributorsCSVSchema = JSON.stringify(contributorCSVSchema);
const escapedGuildCSVMappingSchema = JSON.stringify(guildCSVMappingSchema);

execP(`idx schema:publish ${did} '${escapedContributorSchema}'`)
  .then(resp => {
    console.log("Contributor Profile");
    console.log(resp.stdout);
    console.error(resp.stderr);
  })
  .catch(err => {
    console.error(err);
  });

execP(`idx schema:publish ${did} '${escapedContributorsCSVSchema}'`)
  .then(resp => {
    console.log("Contributor CSV");
    console.log(resp.stdout);
    console.error(resp.stderr);
  })
  .catch(err => {
    console.error(err);
  });

//ceramic://k3y52l7qbv1frxli9be7tgqhymexl50ah5xgdfkltu2skoqrjpp4kgat5v9qif9q8

execP(`idx schema:publish ${did} '${escapedGuildCSVMappingSchema}'`)
  .then(resp => {
    console.log("Guild to CSV mapping");
    console.log(resp.stdout);
    console.error(resp.stderr);
  })
  .catch(err => {
    console.error(err);
  });
