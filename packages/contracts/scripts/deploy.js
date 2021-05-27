require("dotenv").config();
const fs = require('fs');
const { ethers, network, upgrades } = require("hardhat");

const ADDRESSES_FILE = './addresses.json';

const main = async () => {
    
    console.log(`Deploying on ${network.name}`);

    if (network.name === 'localhost') {
        [admin, alice, bob] = await ethers.getSigners();
        const DAIMock = await ethers.getContractFactory("DAIMock");
        dai = await DAIMock.connect(admin).deploy();
        await dai.initialize("Fake DAI", "fDAI");

        await dai.mint(alice.address, ethers.utils.parseEther("100"))
        await dai.mint(bob.address, ethers.utils.parseEther("100"))
    }

    const GuildAppTemplate = await ethers.getContractFactory("GuildApp");
    const guildAppTemplate = await GuildAppTemplate.deploy();

    const GuildFactory = await ethers.getContractFactory("GuildFactory");
    const guildFactory = await GuildFactory.deploy();
    await guildFactory.initialize(guildAppTemplate.address)

    if (!['hardhat', 'localhost'].includes(network.name)) {
        console.log('Finishing deployment...');
        const json = fs.readFileSync(ADDRESSES_FILE);
        const addresses = JSON.parse(json.length > 0 ? json : "{}");
        addresses[network.name] = {
            GuildAppTemplate: guildAppTemplate.address,
            GuildFactory: guildFactory.address,
        };
        fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 4));
        
        console.log(`Deployed contract addresses can be found at ${ADDRESSES_FILE}.\nDone!`);
    } else {
        console.log('Contracts:');
        console.log('fDAI:\t', dai.address);
        console.log('GuildApp Template:\t', guildAppTemplate.address);
        console.log('GuildFactory:\t', guildFactory.address);
    }
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });