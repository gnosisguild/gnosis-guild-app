const contributorSchema = require("../schemas/contributor");
const contributorCSVSchema = require("../schemas/contributor_csv");
const guildCSVMappingSchema = require("../schemas/guild_to_csv_mapping");
const { exec } = require("child_process");
const util = require("util");
const execP = util.promisify(exec);

const escapedContributorSchema = JSON.stringify(contributorSchema);
const escapedContributorsCSVSchema = JSON.stringify(contributorCSVSchema);
const escapedGuildCSVMappingSchema = JSON.stringify(guildCSVMappingSchema);

execP(
  `idx schema:publish did:key:z6MkvVDYv8tbsHt71thPou827LLnHGjgjtMQSeUUBRE6pYAD '${escapedContributorSchema}'`
)
  .then(resp => {
    console.log(resp);
    console.log(resp.stdout);
    console.error(resp.stderr);
  })
  .catch(err => {
    console.error(err);
  });

execP(
  `idx schema:publish did:key:z6MkfR7Kj5kn3XZTooPGLU22ztPSmmzCnkYTB7ifibwBfBcu '${escapedContributorsCSVSchema}'`
)
  .then(resp => {
    console.log(resp);
    console.log(resp.stdout);
    console.error(resp.stderr);
  })
  .catch(err => {
    console.error(err);
  });

execP(
  `idx schema:publish did:key:z6MkfR7Kj5kn3XZTooPGLU22ztPSmmzCnkYTB7ifibwBfBcu '${escapedGuildCSVMappingSchema}'`
)
  .then(resp => {
    console.log(resp);
    console.log(resp.stdout);
    console.error(resp.stderr);
  })
  .catch(err => {
    console.error(err);
  });
