require("dotenv").config();
const fs = require('fs');
const { ethers, network } = require("hardhat");

const GuildAppABI = require("../artifacts/contracts/guild/GuildApp.sol/GuildApp.json").abi;
const GuildFactoryABI = require("../artifacts/contracts/factory/GuildFactory.sol/GuildFactory.json").abi;

const ADDRESSES_FILE = './addresses.json';
const SUBSCRIPTION_PRICE = ethers.utils.parseEther("5");
const SUBSCRIPTION_PERIOD_DEFAULT = 3600 * 24 * 30;
const NFT_BASE_URI = 'ipfs://';

const createGuild = async (wallet, guildFactory, tokenAddress, guildName, guildSymbol, metadataCID) => {
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
            ]
        )
    ).data;
    const rs = await guildFactory.connect(wallet).functions['createGuild(bytes)'](initData);
    const receipt = await rs.wait();
    const [ guildOwner, guild ] = receipt.events.find(e => e.event === 'NewGuild').args;

    return new ethers.Contract(guild, GuildAppABI, wallet);
};

const main = async () => {

    DAI_ADDRESS = "0x9E545E3C0baAB3E08CdfD552C960A1050f373042";
    FACTORY_ADDRESS = "0x95401dc811bb5740090279Ba06cfA8fcF6113778"

    if (network.name === 'localhost') {
        [admin, alice, bob] = await ethers.getSigners();

        const guildFactory = new ethers.Contract(FACTORY_ADDRESS, GuildFactoryABI, admin);

        const guildA = await createGuild(alice, guildFactory, DAI_ADDRESS, "Alice Guild", "GUILD0", "dummyMetadataHashForAlice");
        const guildB = await createGuild(bob, guildFactory, DAI_ADDRESS, "Bob Guild", "GUILD1", "dummyMetadataHashForBob");

        console.log("Created Guilds", [guildA.address, guildB.address]);

    } else {
        const json = fs.readFileSync(ADDRESSES_FILE);
        const addresses = JSON.parse(json.length > 0 ? json : "{}");
        if (addresses[network.name]) {
            [wallet] = await ethers.getSigners();

            const guildFactory = new ethers.Contract(addresses[network.name]['GuildFactory'], GuildFactoryABI, wallet);

            const guildA = await createGuild(wallet, guildFactory, "0x15f0ca26781c3852f8166ed2ebce5d18265cceb7", "Alice Guild", "GUILD0", "dummyMetadataHashForAlice");

            console.log(`Created Guild on ${network.name}`, [guildA.address]);
        } else {
            console.error(`Contract addresses not found for ${network.name} network`);
        }
        // console.error("This script is meant to be used for local development purposes");
    }
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });