require("dotenv").config();
const fs = require('fs');
const { ethers, network } = require("hardhat");

const GuildAppABI = require("../artifacts/contracts/guild/GuildApp.sol/GuildApp.json").abi;
const GuildFactoryABI = require("../artifacts/contracts/factory/GuildFactory.sol/GuildFactory.json").abi;

const ADDRESSES_FILE = './addresses.json';
// const SUBSCRIPTION_PRICE = ethers.utils.parseEther("5");
// const SUBSCRIPTION_PERIOD_DEFAULT = 3600 * 24 * 30;
const SUBSCRIPTION_PRICE = ethers.utils.parseEther("0.0000000001");
const SUBSCRIPTION_PERIOD_DEFAULT = 60 * 2;
const NFT_BASE_URI = 'ipfs://';

const createGuild = async (wallet, guildFactory, tokenAddress, guildName, guildSymbol, metadataCID, allowanceModule) => {
    guildAppTemplateAddr = await guildFactory.template();
    const guildAppTemplate = new ethers.Contract(guildAppTemplateAddr, GuildAppABI, wallet);
    const initData = (
        await guildAppTemplate.connect(wallet).populateTransaction.initialize(
            wallet.address,
            tokenAddress,
            SUBSCRIPTION_PRICE,
            SUBSCRIPTION_PERIOD_DEFAULT.toString(),
            [
                guildName,
                guildSymbol,
                NFT_BASE_URI,
                metadataCID,
            ],
            allowanceModule,
        )
    ).data;
    const rs = await guildFactory.connect(wallet).functions['createGuild(bytes)'](initData);
    const receipt = await rs.wait();
    const [ guildOwner, guild ] = receipt.events.find(e => e.event === 'NewGuild').args;

    return new ethers.Contract(guild, GuildAppABI, wallet);
};

const main = async () => {

    console.log("NET", network.name);

    if (network.name === 'localhost') {
        // MUST RUN `yarn deploy --network localhost` first and then copy the contract addresses printed in the console
        const DAI_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
        const FACTORY_ADDRESS = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

        [admin, alice, bob] = await ethers.getSigners();

        const guildFactory = new ethers.Contract(FACTORY_ADDRESS, GuildFactoryABI, admin);

        const guildA = await createGuild(
            alice,
            guildFactory,
            DAI_ADDRESS,
            "Alice Guild",
            "GUILD0",
            "dummyMetadataHashForAlice",
            ethers.constants.AddressZero,
        );
        const guildB = await createGuild(
            bob,
            guildFactory,
            DAI_ADDRESS,
            "Bob Guild",
            "GUILD1",
            "dummyMetadataHashForBob",
            ethers.constants.AddressZero,
        );

        console.log("Created Guilds", [guildA.address, guildB.address]);

    } else {
        // TODO: Only works on Rinkeby
        // TOKEN_ADDRESS = "0x15f0ca26781c3852f8166ed2ebce5d18265cceb7"; // fDAI
        const TOKEN_ADDRESS = ethers.constants.AddressZero;
        const ALLOWANCE_MODULE = "0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134";
        const json = fs.readFileSync(ADDRESSES_FILE);
        const addresses = JSON.parse(json.length > 0 ? json : "{}");
        if (addresses[network.name]) {
            [wallet] = await ethers.getSigners();

            const guildFactory = new ethers.Contract(addresses[network.name]['GuildFactory'], GuildFactoryABI, wallet);

            const guildA = await createGuild(
                wallet,
                guildFactory,
                TOKEN_ADDRESS,
                "Test Guild",
                "GUILD0",
                "dummyMetadataHashForAlice",
                ALLOWANCE_MODULE,
            );

            console.log(`Created Guild on ${network.name}`, [guildA.address]);
        } else {
            console.error(`Contract addresses not found for ${network.name} network`);
        }
    }
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });