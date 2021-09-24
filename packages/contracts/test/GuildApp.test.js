const { expect } = require("chai");
const { ethers, network, waffle } = require("hardhat"); // explicit, however already available in the global scope
// const { deployContract, provider } = waffle;

const GuildAppABI = require("../artifacts/contracts/guild/GuildApp.sol/GuildApp.json").abi;

const testUtils = require("./utils");

const SUBSCRIPTION_PRICE = ethers.utils.parseEther("5");
const SUBSCRIPTION_PRICE_ETH = ethers.utils.parseEther("0.1");
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
    let carl;
    let diana;
    let degen;
    let regen;

    let mintedSubs = 0;
    let burnedSubs = 0;
    let activeSubId;

    before(async () => {
        [admin, alice, bob, carl, diana, degen, regen] = await ethers.getSigners();

        const DAIMock = await ethers.getContractFactory("DAIMock");
        dai = await DAIMock.connect(admin).deploy();
        await dai.initialize("Fake DAI", "fDAI");
        console.log('fDAI', dai.address);

        await dai.connect(admin).mint(alice.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(bob.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(carl.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(diana.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(degen.address, ethers.utils.parseEther("100"));

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
        const factory = guildFactory.connect(alice);
        const nextGuildId = await factory.totalGuilds();
        const guildName = "Alice Guild";
        const guildSymbol = `GUILD${nextGuildId})`;
        const metadataCID = "dummyMetadataHash"; // IPFS Content Hash from JSON metadata following Opensea standard
        const allowanceModule = ethers.constants.AddressZero; // TODO: add more tests using allowance Module
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
                ],
                allowanceModule,
            )
        ).data;
        const rs = await factory.functions['createGuild(bytes)'](initData);
        const receipt = await rs.wait();
        const [ guildOwner, guild ] = receipt.events.find(e => e.event === 'NewGuild').args;
        expect(guildOwner).to.equal(alice.address);
        guildA = new ethers.Contract(guild, GuildAppABI, alice);
        expect(await factory.totalGuilds()).to.equal(ethers.BigNumber.from(1));
        expect(await guildA.initialized()).to.equal(true);
        expect(await guildA.name()).to.equal(guildName);
        expect(await guildA.symbol()).to.equal(guildSymbol);
        expect(await guildA.baseURI()).to.equal(NFT_BASE_URI);
        expect(await guildA.getMetadata()).to.equal(`${NFT_BASE_URI}${metadataCID}`);
        expect(await guildA.hasRole(await guildA.DEFAULT_ADMIN_ROLE(), alice.address)).to.equal(true);
    });

    it("Should allow new subscriptions", async () => {
        const balanceBefore = await guildA.guildBalance(dai.address);
        const lastTokenId = await guildA.totalSupply();
        const tokenURI = '';
        await dai.connect(bob).approve(guildA.address, SUBSCRIPTION_PRICE); // This should be done by the SpendingLimit module on Safe accounts
        const rs = await guildA.connect(bob).subscribe(bob.address, tokenURI, SUBSCRIPTION_PRICE, "0x");
        mintedSubs++;
        const receipt = await rs.wait();
        const block = await ethers.provider.getBlock(receipt.blockNumber);

        const [ subscriber, tokenId, value, expirationTimestamp ] = receipt.events.find(e => e.event === 'NewSubscription').args;
        expect(subscriber).to.equal(bob.address);
        expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + mintedSubs);
        expect(value.toString()).to.equal(SUBSCRIPTION_PRICE.toString());
        expect(+expirationTimestamp).to.equal(block.timestamp + SUBSCRIPTION_PERIOD_DEFAULT);

        const subscription = await guildA.subscriptionByOwner(bob.address);
        expect(+subscription.tokenId.toString()).to.equal(+lastTokenId.toString() + mintedSubs);

        expect(await guildA.tokenURI(tokenId)).to.equal(`${NFT_BASE_URI}${tokenURI}#${tokenId}`);

        const balanceAfter = await guildA.guildBalance(dai.address);

        expect(balanceBefore.add(SUBSCRIPTION_PRICE)).to.equal(balanceAfter);

        activeSubId = tokenId;
    });

    it("Should not allow to unsubscribe if not the subs owner", async () => {
        await expect(guildA.connect(diana)
            .unsubscribe(activeSubId))
            .to.be.revertedWith("GuildApp: Caller is not the owner of the subscription");
    });

    it("Should not allow to unsubscribe if subscription doesn't exists", async () => {
        await expect(guildA.connect(diana)
            .unsubscribe("100"))
            .to.be.revertedWith("GuildApp: Subscription does not exist");
    });

    it("Should allow to unsubscribe", async () => {
        await guildA.connect(bob).unsubscribe(activeSubId);
        const subscription = await guildA.subscriptionByOwner(bob.address);
        expect(+subscription.tokenId.toString()).to.equal(0);
        expect(+subscription.expirationTimestamp.toString()).to.equal(0);
        burnedSubs++;
    });

    it("Should not allow to transfer burned subscriptions", async () => {
        await expect(guildA.connect(bob)['safeTransferFrom(address,address,uint256,bytes)'](bob.address, degen.address, activeSubId, "0x"))
            .to.be.revertedWith("revert ERC721: operator query for nonexistent token");
    })

    it("Should allow to subscribe & transfer", async () => {
        const lastTokenId = await guildA.totalSupply() + burnedSubs;
        const tokenURI = '';
        await dai.connect(degen).approve(guildA.address, SUBSCRIPTION_PRICE); // This should be done by the SpendingLimit module on Safe accounts
        let rs = await guildA.connect(degen).subscribe(degen.address, tokenURI, SUBSCRIPTION_PRICE, "0x");
        let receipt = await rs.wait();
        let block = await ethers.provider.getBlock(receipt.blockNumber);

        const [ subscriber, tokenId, value, expirationTimestamp ] = receipt.events.find(e => e.event === 'NewSubscription').args;
        expect(subscriber).to.equal(degen.address);
        expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + 1);
        expect(value.toString()).to.equal(SUBSCRIPTION_PRICE.toString());
        expect(+expirationTimestamp).to.equal(block.timestamp + SUBSCRIPTION_PERIOD_DEFAULT);

        rs = await guildA.connect(degen)['safeTransferFrom(address,address,uint256,bytes)'](degen.address, regen.address, tokenId, "0x");
        receipt = await rs.wait();
        block = await ethers.provider.getBlock(receipt.blockNumber);

        const [ _from, _to, _tokenId ] = receipt.events.find(e => e.event === 'Transfer').args;
        expect(_from).to.equal(degen.address);
        expect(_to).to.equal(regen.address);
        expect(_tokenId.toString()).to.equal(tokenId.toString());

        await testUtils.verifyNewOwnership(guildA, degen.address, regen.address, {
            subId: tokenId,
            expirationTimestamp,
        });

        rs = await guildA.connect(regen)['transferFrom(address,address,uint256)'](regen.address, degen.address, tokenId);
        await rs.wait();
        await testUtils.verifyNewOwnership(guildA, regen.address, degen.address, {
            subId: tokenId,
            expirationTimestamp,
        });

        activeSubId = tokenId;
    });

    it("Should not allow subscription transfers if not an owner", async () => {
        await expect(guildA.connect(regen)['safeTransferFrom(address,address,uint256,bytes)'](regen.address, degen.address, activeSubId, "0x"))
            .to.be.revertedWith("revert ERC721: transfer caller is not owner nor approved");

        await expect(guildA.connect(regen)['transferFrom(address,address,uint256)'](regen.address, degen.address, activeSubId))
            .to.be.revertedWith("revert ERC721: transfer caller is not owner nor approved");
    });

    it("Should allow to update Guild metadata to guild owner", async () => {

        const newMetadataHash = 'anotherDummyIPFSHash';

        await expect(guildA.connect(alice).setMetadata(newMetadataHash))
            .to.emit(guildA, 'UpdatedMetadata')
            .withArgs(`${NFT_BASE_URI}${newMetadataHash}`);

        await expect(guildA.connect(bob).setMetadata(newMetadataHash)).to.be.revertedWith("GuildApp: Sender doesn't have an Admin role");
    });

    it("Should fetch approved tokens", async () => {
        expect(await guildA.approvedTokens()).to.have.members([dai.address]);
    });

    it("Should be able to update subscription price & asset to ETH", async () => {
        await guildA.connect(alice).updateSubscriptionPrice(
            ethers.constants.AddressZero,
            SUBSCRIPTION_PRICE_ETH.toString(),
        );
        const approvedTokens = await guildA.approvedTokens();
        expect(approvedTokens).to.have.members([dai.address, ethers.constants.AddressZero]);
        expect(await guildA.tokenAddress()).to.equal(ethers.constants.AddressZero);
        expect((await guildA.subPrice()).toString()).to.equal(SUBSCRIPTION_PRICE_ETH);

    });

    it("Should not allow a new subscription with fDAI", async () => {
        const tokenURI = '';
        await dai.connect(carl).approve(guildA.address, SUBSCRIPTION_PRICE); // This should be done by the SpendingLimit module on Safe accounts
        const tx = guildA.connect(carl).subscribe(carl.address, tokenURI, SUBSCRIPTION_PRICE, "0x");
        await expect(tx).to.be.revertedWith("GuildApp: incorrect msg.value");
    });

    it("Should allow new subscriptions using ETH", async () => {
        const balanceBefore = await guildA.guildBalance(ethers.constants.AddressZero);
        const lastTokenId = +(await guildA.totalSupply()).toString() + burnedSubs;
        const tokenURI = '';
        const rs = await guildA.connect(carl).subscribe(carl.address, tokenURI, SUBSCRIPTION_PRICE_ETH, "0x", {
            value: SUBSCRIPTION_PRICE_ETH
        });
        mintedSubs++;
        const receipt = await rs.wait();
        const block = await ethers.provider.getBlock(receipt.blockNumber);

        const [ subscriber, tokenId, value, expirationTimestamp ] = receipt.events.find(e => e.event === 'NewSubscription').args;
        expect(subscriber).to.equal(carl.address);
        expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + 1);
        expect(value.toString()).to.equal(SUBSCRIPTION_PRICE_ETH.toString());
        expect(+expirationTimestamp).to.equal(block.timestamp + SUBSCRIPTION_PERIOD_DEFAULT);

        const subscription = await guildA.subscriptionByOwner(carl.address);
        expect(+subscription.tokenId.toString()).to.equal(+lastTokenId.toString() + 1);

        expect(await guildA.tokenURI(tokenId)).to.equal(`${NFT_BASE_URI}${tokenURI}#${tokenId}`);

        const balanceAfter = await guildA.guildBalance(ethers.constants.AddressZero);

        expect(balanceBefore.add(SUBSCRIPTION_PRICE_ETH)).to.equal(balanceAfter);
    });

    it("Should be able to withdraw any guild balance", async () => {
        const approvedTokens = await guildA.approvedTokens();
        for(i = 0; i < approvedTokens.length; i++) {
            const asset = approvedTokens[i];
            let guildBalance = await guildA.guildBalance(asset);
            const balance = asset != ethers.constants.AddressZero 
                ? await dai.balanceOf(guildA.address)
                : await alice.provider.getBalance(guildA.address);

            expect(guildBalance).to.equal(balance);

            // On-purpose to test cases when benenficiary is specified
            const beneficiary = asset != ethers.constants.AddressZero ? diana.address : ethers.constants.AddressZero;
            const beneficiaryBalance = asset != ethers.constants.AddressZero 
                ? await dai.balanceOf(beneficiary)
                : await alice.getBalance();

            const rs = await guildA.connect(alice).withdraw(asset, guildBalance.toString(), beneficiary);
            const tx = await rs.wait();

            expect(await guildA.guildBalance(asset)).to.equal(ethers.BigNumber.from(0));

            const afterBalance = beneficiary != ethers.constants.AddressZero 
                    ? await dai.balanceOf(beneficiary)
                    : await alice.getBalance();
            if (asset != ethers.constants.AddressZero) {
                expect(+afterBalance).to.be.greaterThanOrEqual(+(beneficiaryBalance.add(guildBalance)));
            } else {
                const gasFees = rs.gasPrice.mul(tx.cumulativeGasUsed);
                expect(afterBalance).to.equal(beneficiaryBalance.add(guildBalance).sub(gasFees));
            }
        }

    });

    it("Should not be able to pause the guild by non admin", async () => {
        await expect(guildA.connect(bob).pauseGuild(true)).to.be.revertedWith("GuildApp: Sender doesn't have an Admin role");
    });

    it("Should be able to pause the guild", async () => {
        await expect(guildA.connect(alice).pauseGuild(true))
            .to.emit(guildA, 'PausedGuild')
            .withArgs(true);
    });

    it("Should not be able to do any action on a paused guild", async () => {

        const newMetadataHash = 'dummyIPFSHashV2';

        await expect(guildA.connect(alice).updateSubscriptionPrice(dai.address, SUBSCRIPTION_PRICE))
            .to.be.revertedWith("GuildApp: The Guild is disabled");

        await expect(guildA.connect(alice).setMetadata(newMetadataHash))
            .to.be.revertedWith("GuildApp: The Guild is disabled");        
        
        await dai.connect(diana).approve(guildA.address, SUBSCRIPTION_PRICE);
        await expect(guildA.connect(diana).subscribe(diana.address, '', SUBSCRIPTION_PRICE, "0x"))
            .to.be.revertedWith("GuildApp: The Guild is disabled");
    });

});