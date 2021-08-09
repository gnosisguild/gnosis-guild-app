const express = require("express");
const dotenv = require("dotenv");
const ethers = require("ethers");
const graphqlRequest = require("graphql-request");

dotenv.config();

const GuildAppABI = require("./contracts/GuildApp.json");

const AllowanceModuleABI = [
    "function getTokenAllowance(address safe, address delegate, address token) public view returns (uint256[5] memory)",
]

const app = express();
app.use(express.json()); // for parsing application/json

if (!process.env.JSON_RPC) {
    console.error("Missing JSON_RPC URI");
    return;
}

if (!process.env.MNEMONIC) {
    console.error("Missing MNEMONIC for Relayer");
    return;
}

if (!process.env.SUBGRAPH_URL) {
    console.error("Missing SUBGRAPH_URL");
    return;
}

const fetchGuilds = async (date) => {
    const subsQuery = graphqlRequest.gql`
        query outstandingSubscriptions($date: String) {
            guildSubscriptions(where: { expires_lte: $date, active: true }) {
                id
                guild {
                    id
                    tokenAddress
                }
                keyId
                owner
                expires
                paymentHistory(orderBy: purchasedAt, orderDirection: desc, first: 1) {
                    transferSignature
                    value
                }
            }
        }
      `;
    try {
      const resp = await graphqlRequest.request(process.env.SUBGRAPH_URL, subsQuery, {
        date,
      });
      console.log('RES', resp);
      if (resp.guildSubscriptions && resp.guildSubscriptions.length) {
        return resp.guildSubscriptions;
      }
    } catch (err) {
      console.error(`Failed to fetch Outstanding Subscriptions: ${err}`);
    }
    return [];
};

const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC);
let  signer = ethers.Wallet.fromMnemonic(process.env.MNEMONIC);
signer = signer.connect(provider);

const allowanceModule = new ethers.Contract(
    "0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134",
    AllowanceModuleABI,
    signer,
)

app.get('/', async (req, res) => {
    const date = (Date.now() / 1000).toFixed(0);
    console.log('Date', date);
    const rs = await fetchGuilds(date);

    for(i = 0; i < rs.length; i++) {
        const guildSubscription = rs[i];
        const guildAddress = guildSubscription.guild.id;
        const guildContract = new ethers.Contract(
            guildAddress,
            GuildAppABI,
            signer,
        );
        const args = [
            guildSubscription.owner,
            "", // tokenURI: empty for renewals
            guildSubscription.paymentHistory[0].value,
            guildSubscription.paymentHistory[0].transferSignature,
        ];
        try {
            const allowance = await allowanceModule.getTokenAllowance(
                guildSubscription.owner, // safe
                guildContract.address, // delegate
                guildSubscription.guild.tokenAddress,
            )
            console.log('Allowance', {
                amount: allowance[0].toString(),
                spent: allowance[1].toString(),
                resetTimeMin: allowance[2].toString(),
                lastResetMin: allowance[3].toString(),
                nonce: allowance[4].toString(),
            });
            console.log('====> NEW Renewal Subscription to process', guildAddress, args);
            const rs = await guildContract.subscribe(...args);
            await rs.wait();
            console.log('====> PROCESSED SUBSCRIPTION', {
                guild: guildContract.address,
                subscriber: guildSubscription.owner,
                keyId: guildSubscription.keyId,
                lastExpire: new Date(+guildSubscription.expires * 1000)
            })
        } catch (error) {
            console.error(`
                \n
                < ============================================================================================================= >
                \n
                Error while trying to process Sub ${guildAddress}:${guildSubscription.keyId} | Args ${args} | Reason: \n ${error}
                \n
                < ============================================================================================================= >
                \n
            `);
        }
    }
    
    res.send({
        relayer: await signer.getAddress(),
        balance: (await signer.getBalance()).toString(),
        records: rs,
    });
});


app.listen(process.env.PORT || 3000, () => {
    console.log(`Relayer is running on port ${process.env.PORT || 5000}`);
});