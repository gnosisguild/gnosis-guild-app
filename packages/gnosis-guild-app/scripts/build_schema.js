const contributorSchema = require("../schemas/contributor");
const { exec } = require("child_process");
const util = require("util");
const execP = util.promisify(exec);

const escapedContributorSchema = JSON.stringify(contributorSchema);

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
