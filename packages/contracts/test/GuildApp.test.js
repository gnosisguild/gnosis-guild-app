const { expect } = require("chai");
const { ethers, network, waffle } = require("hardhat"); // explicit, however already available in the global scope
// const { deployContract, provider } = waffle;

const GuildAppABI = require("../artifacts/contracts/guild/GuildApp.sol/GuildApp.json").abi;

const SUBSCRIPTION_PRICE = ethers.utils.parseEther("5");
const SUBSCRIPTION_PERIOD_DEFAULT = 3600 * 24 * 30;
const NFT_BASE_URI = 'ipfs://';

describe("GuildApp", () => {

    let dai;
    let guildFactory;
    let guildAppTemplate;
    let guildA;

    let admin;
    let alice;
    let bob;

    before(async () => {
        [admin, alice, bob] = await ethers.getSigners();

        const DAIMock = await ethers.getContractFactory("DAIMock");
        dai = await DAIMock.connect(admin).deploy();
        await dai.initialize("Fake DAI", "fDAI");
        console.log('fDAI', dai.address);

        await dai.connect(admin).mint(alice.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(bob.address, ethers.utils.parseEther("100"));

        const GuildAppTemplate = await ethers.getContractFactory("GuildApp");
        guildAppTemplate = await GuildAppTemplate.deploy();
        console.log('GuildApp template', guildAppTemplate.address);

        const GuildFactory = await ethers.getContractFactory("GuildFactory");
        guildFactory = await GuildFactory.deploy();
        await guildFactory.initialize(guildAppTemplate.address)

        console.log('GuildFactory', guildFactory.address);
    });

    it("Should have a Guild template", async () => {
        expect(await guildFactory.template()).to.equal(guildAppTemplate.address);
    });

    it("Should verify if participants have some ERC20 token balance", async () => {
        expect(await dai.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("100"));
        expect(await dai.balanceOf(bob.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should try to deploy a new Guild but reverts as it isn't initialized", async () => {
        const initData = "0x";
        await expect(guildFactory.connect(alice).functions['createGuild(bytes)'](initData)).to.be.reverted;
    });

    it("Should deploy a new Guild Subscriptions using fDAI", async () => {
        const guildName = "Alice Guild";
        const guildSymbol = "GUILD0";
        const metadataCID = "dummyMetadataHash"; // IPFS Content Hash from JSON metadata following Opensea standard
        const initData = (
            await guildAppTemplate.connect(alice).populateTransaction.initialize(
                alice.address,
                dai.address,
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
        const rs = await guildFactory.connect(alice).functions['createGuild(bytes)'](initData);
        const receipt = await rs.wait();
        const [ guildOwner, guild ] = receipt.events.find(e => e.event === 'NewGuild').args;
        expect(guildOwner).to.equal(alice.address);
        guildA = new ethers.Contract(guild, GuildAppABI, alice);
        expect(await guildA.initialized()).to.equal(true);
        expect(await guildA.name()).to.equal(guildName);
        expect(await guildA.symbol()).to.equal(guildSymbol);
        expect(await guildA.baseURI()).to.equal(NFT_BASE_URI);
        expect(await guildA.getMetadata()).to.equal(`${NFT_BASE_URI}${metadataCID}`);
    });

    it("Should allow new subscriptions", async () => {
        const balanceBefore = await guildA.guildBalance(dai.address);
        const lastTokenId = await guildA.totalSupply();
        const tokenURI = '';
        await dai.connect(bob).approve(guildA.address, SUBSCRIPTION_PRICE); // This should be done by the SpendingLimit module on Safe accounts
        const rs = await guildA.connect(bob).subscribe(tokenURI, SUBSCRIPTION_PRICE, "0x");
        const receipt = await rs.wait();
        const block = await ethers.provider.getBlock(receipt.blockNumber);

        const [ tokenId, value, expirationTimestamp ] = receipt.events.find(e => e.event === 'NewSubscription').args;
        expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + 1);
        expect(value.toString()).to.equal(SUBSCRIPTION_PRICE.toString());
        expect(+expirationTimestamp).to.equal(block.timestamp + SUBSCRIPTION_PERIOD_DEFAULT);

        const subscription = await guildA.subscriptionByOwner(bob.address);
        expect(+subscription.tokenId.toString()).to.equal(+lastTokenId.toString() + 1);

        expect(await guildA.tokenURI(tokenId)).to.equal(`${NFT_BASE_URI}${tokenURI}#${tokenId}`);

        const balanceAfter = await guildA.guildBalance(dai.address);

        expect(balanceBefore.add(SUBSCRIPTION_PRICE)).to.equal(balanceAfter);
    });

    it("Should allow to update Guild metadata to guild owner", async () => {

        const newMetadataHash = 'anotherDummyIPFSHash';

        await expect(guildA.connect(alice).setMetadata(newMetadataHash))
            .to.emit(guildA, 'UpdatedMetadata')
            .withArgs(`${NFT_BASE_URI}${newMetadataHash}`);

        await expect(guildA.connect(bob).setMetadata(newMetadataHash)).to.be.reverted;
    });

    it("Should fetch approved tokens", async () => {
        console.log(await guildA.approvedTokens(), [dai.address]);
        expect(await guildA.approvedTokens()).to.have.members([dai.address]);
    });

});