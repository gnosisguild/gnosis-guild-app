import { ethers, network, waffle } from "hardhat";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { solidity } from 'ethereum-waffle';
import { expect, use } from "chai";
// const { deployContract, provider } = waffle;

import GuildAppABI from "../artifacts/contracts/guild/GuildApp.sol/GuildApp.json";

import * as testUtils from "./utils";

import { DaiMock } from "../src/types/DaiMock";
// import { GnosisSafe } from "../src/types/GnosisSafe";
// import { GnosisSafeProxy } from "../src/types/GnosisSafeProxy";
import { GuildFactory } from "../src/types/GuildFactory";
import { GuildApp } from "../src/types/GuildApp";
// import { MultiSend } from "../src/types/MultiSend";

const SUBSCRIPTION_PRICE = ethers.utils.parseEther("5");
const SUBSCRIPTION_PRICE_ETH = ethers.utils.parseEther("0.1");
const SUBSCRIPTION_PERIOD_DEFAULT = 3600 * 24 * 30;
const NFT_BASE_URI = 'ipfs://';

use(solidity);

describe("GuildApp", () => {

    let dai: DaiMock;
    let guildFactory: GuildFactory;
    let guildAppTemplate: GuildApp;
    let guildA: GuildApp;

    // let GnosisSafeContract: GnosisSafe;
    // let gnosisSafeSingleton: GnosisSafe;
    // let gnosisMultisend: MultiSend;

    let admin: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    // let gnosisSafeBob: GnosisSafe;
    let carl: SignerWithAddress;
    let diana: SignerWithAddress;
    let degen: SignerWithAddress;
    let regen: SignerWithAddress;

    let mintedSubs: number = 0;
    let burnedSubs: number = 0;
    let activeSubId: string;

    before(async () => {
        [admin, alice, bob, carl, diana, degen, regen] = await ethers.getSigners();

        // Mock token
        const DAIMockContract = await ethers.getContractFactory("DAIMock");
        dai = (await DAIMockContract.connect(admin).deploy()) as DaiMock;
        await dai.initialize("Fake DAI", "fDAI");
        console.log('fDAI', dai.address);

        // Drip tokens to users
        await dai.connect(admin).mint(alice.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(bob.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(carl.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(diana.address, ethers.utils.parseEther("100"));
        await dai.connect(admin).mint(degen.address, ethers.utils.parseEther("100"));

        // Deploy GuildFactory
        const GuildAppTemplateContract = await ethers.getContractFactory("GuildApp");
        guildAppTemplate = (await GuildAppTemplateContract.deploy()) as GuildApp;
        console.log('GuildApp template', guildAppTemplate.address);

        const GuildFactoryContract = await ethers.getContractFactory("GuildFactory");
        guildFactory = (await GuildFactoryContract.deploy()) as GuildFactory;
        await guildFactory.initialize(guildAppTemplate.address)

        console.log('GuildFactory', guildFactory.address);

        // // Gnosis Safe Proxy Factory
        // const GnosisSafeContract = await ethers.getContractFactory('GnosisSafe');
        // gnosisSafeSingleton = await GnosisSafeContract.deploy() as GnosisSafe;
        // const gnosisSafeProxyContract = await ethers.getContractFactory('GnosisSafeProxy');
        // const gnosisSafeProxy = await gnosisSafeProxyContract.deploy(gnosisSafeSingleton.address) as GnosisSafeProxy;
        // const MultiSendContract = await ethers.getContractFactory('MultiSend');
        // gnosisMultisend = (await MultiSendContract.deploy()) as MultiSend;


        // gnosisSafeBob = GnosisSafeContract.attach(gnosisSafeProxy.address) as GnosisSafe;
        // // TODO: move this to a it section
        // // TODO: deploy allowancemodule?
        // // TODO: enablemodule encodeTx
        // // TODO: gnosis setup
        // // TODO: make sure module is enabled
    });

    it("Setup: Should have a Guild template", async () => {
        expect(await guildFactory.template()).to.equal(guildAppTemplate.address);
    });

    it("Setup: Should verify if participants have some ERC20 token balance", async () => {
        expect(await dai.balanceOf(alice.address)).to.equal(ethers.utils.parseEther("100"));
        expect(await dai.balanceOf(bob.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Setup: Should try to deploy a new Guild but reverts as it isn't initialized", async () => {
        const initData = "0x";
        await expect(guildFactory.connect(alice).functions['createGuild(bytes)'](initData)).to.be.reverted;
    });

    it("Guild: Should deploy a new Guild Subscriptions using fDAI for EOA accounts only", async () => {
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
                {
                    name: guildName,
                    symbol: guildSymbol,
                    baseURI: NFT_BASE_URI,
                    metadataCID,
                },
                allowanceModule,
            )
        ).data!;
        const rs = await factory.functions['createGuild(bytes)'](initData);
        const receipt = await rs.wait();
        const [ guildOwner, guild ] = receipt?.events?.find(e => e.event === 'NewGuild')?.args!;
        expect(guildOwner).to.equal(alice.address);
        guildA = new ethers.Contract(guild, GuildAppABI.abi, alice) as GuildApp;
        expect(await factory.totalGuilds()).to.equal(ethers.BigNumber.from(1));
        expect(await guildA.initialized()).to.equal(true);
        expect(await guildA.name()).to.equal(guildName);
        expect(await guildA.symbol()).to.equal(guildSymbol);
        expect(await guildA.baseURI()).to.equal(NFT_BASE_URI);
        expect(await guildA.getMetadata()).to.equal(`${NFT_BASE_URI}${metadataCID}`);
        expect(await guildA.hasRole(await guildA.DEFAULT_ADMIN_ROLE(), alice.address)).to.equal(true);
    });

    // TODO:
    // GuildApp: Invalid token

    it("Guild: Should allow to update Guild metadata to guild owner", async () => {
        const newMetadataHash = 'anotherDummyIPFSHash';

        await expect(guildA.connect(alice).setMetadata(newMetadataHash))
            .to.emit(guildA, 'UpdatedMetadata')
            .withArgs(`${NFT_BASE_URI}${newMetadataHash}`);

        await expect(guildA.connect(bob).setMetadata(newMetadataHash)).to.be.revertedWith("GuildApp: Sender doesn't have an Admin role");
    });

    it("EOA accounts: Should allow new subscriptions", async () => {
        const balanceBefore = await guildA.guildBalance(dai.address);
        const lastTokenId = await guildA.totalSupply();
        const tokenURI = '';
        // Bob subscribes to Alice Guild
        const { tokenId } = await testUtils.newSubscription(guildA, bob, tokenURI, SUBSCRIPTION_PRICE, dai);
        mintedSubs++;
        expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + mintedSubs);

        const subscription = await guildA.subscriptionByOwner(bob.address);
        expect(+subscription.tokenId.toString()).to.equal(+lastTokenId.toString() + mintedSubs);

        expect(await guildA.tokenURI(tokenId)).to.equal(`${NFT_BASE_URI}${tokenURI}#${tokenId}`);

        const balanceAfter = await guildA.guildBalance(dai.address);

        expect(balanceBefore.add(SUBSCRIPTION_PRICE)).to.equal(balanceAfter);

        activeSubId = tokenId;
    });

    it("Guild: Should send correct subscriber params", async () => {
        const tokenURI = '';
        await expect(guildA.connect(bob)
            .subscribe(diana.address, tokenURI, SUBSCRIPTION_PRICE, "0x"))
            .to.be.revertedWith("GuildApp: msg.sender must be the subscriber");
    });

    it("Guild: Should send correct value params", async () => {
        const tokenURI = '';
        await expect(guildA.connect(bob)
            .subscribe(bob.address, tokenURI, SUBSCRIPTION_PRICE, "0x", {value: SUBSCRIPTION_PRICE}))
            .to.be.revertedWith("GuildApp: incorrect msg.value");
    });

    it("Guild: Should not allow to subscribe if already own an active subscription", async () => {
        const tokenURI = '';
        await expect(guildA.connect(bob)
            .subscribe(bob.address, tokenURI, SUBSCRIPTION_PRICE, "0x"))
            .to.be.revertedWith("GuildApp: still an active subscription");
    });

    // TODO:
    // GuildApp: Guild does not support Safe Allowances

    // TODO: Using CPK
    // GuildApp: ETH should be transferred via AllowanceModule

    it("Guild: Should not allow to unsubscribe if not the subs owner", async () => {
        await expect(guildA.connect(diana)
            .unsubscribe(activeSubId))
            .to.be.revertedWith("GuildApp: Caller is not the owner of the subscription");
    });

    it("Guild: Should not allow to unsubscribe if subscription doesn't exists", async () => {
        await expect(guildA.connect(diana)
            .unsubscribe("100"))
            .to.be.revertedWith("GuildApp: Subscription does not exist");
    });

    it("Guild: Should allow to unsubscribe", async () => {
        await guildA.connect(bob).unsubscribe(activeSubId);
        const subscription = await guildA.subscriptionByOwner(bob.address);
        expect(+subscription.tokenId.toString()).to.equal(0);
        expect(+subscription.expirationTimestamp.toString()).to.equal(0);
        burnedSubs++;
    });

    it("Guild: Should not allow to transfer burned subscriptions", async () => {
        await expect(guildA.connect(bob)['safeTransferFrom(address,address,uint256,bytes)'](bob.address, degen.address, activeSubId, "0x"))
            .to.be.revertedWith("revert ERC721: operator query for nonexistent token");
    });

    it("EOA accounts: Should allow to subscribe & transfer", async () => {
        const lastTokenId = (await guildA.totalSupply()).toNumber() + burnedSubs;
        const tokenURI = '';
        // Degen subscribes to Alice Guild
        const { tokenId, expirationTimestamp } = await testUtils.newSubscription(guildA, degen, tokenURI, SUBSCRIPTION_PRICE, dai);
        expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + mintedSubs);
        mintedSubs++;

        // Degen transfer subscription to Regen
        let rs = await guildA.connect(degen)['safeTransferFrom(address,address,uint256,bytes)'](degen.address, regen.address, tokenId, "0x");
        const receipt = await rs.wait();
        const block = await ethers.provider.getBlock(receipt.blockNumber);

        const [ _from, _to, _tokenId ] = receipt?.events?.find(e => e.event === 'Transfer')?.args!;
        expect(_from).to.equal(degen.address);
        expect(_to).to.equal(regen.address);
        expect(_tokenId.toString()).to.equal(tokenId.toString());

        await testUtils.verifyNewOwnership(guildA, degen.address, regen.address, {
            subId: tokenId,
            expirationTimestamp,
        });

        // Regen returns subscription to Degen
        rs = await guildA.connect(regen)['transferFrom(address,address,uint256)'](regen.address, degen.address, tokenId);
        await rs.wait();
        await testUtils.verifyNewOwnership(guildA, regen.address, degen.address, {
            subId: tokenId,
            expirationTimestamp,
        });

        activeSubId = tokenId;
    });

    it("Guild: Should not allow subscription transfers if not an owner", async () => {
        await expect(guildA.connect(regen)['safeTransferFrom(address,address,uint256,bytes)'](regen.address, degen.address, activeSubId, "0x"))
            .to.be.revertedWith("revert ERC721: transfer caller is not owner nor approved");

        await expect(guildA.connect(regen)['transferFrom(address,address,uint256)'](regen.address, degen.address, activeSubId))
            .to.be.revertedWith("revert ERC721: transfer caller is not owner nor approved");
    });

    it("Guild: Should not allow to transfer another subscription to existing sub holders", async () => {
        const lastTokenId = (await guildA.totalSupply()).toNumber() + burnedSubs;
        const tokenURI = '';
        // Bob subscribes again
        const { tokenId } = await testUtils.newSubscription(guildA, bob, tokenURI, SUBSCRIPTION_PRICE, dai);
        expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + mintedSubs - burnedSubs);
        mintedSubs++;

        // Degen transfer sub to Bob
        await expect(guildA.connect(degen)['transferFrom(address,address,uint256)'](degen.address, bob.address, activeSubId))
            .to.be.revertedWith("revert GuildApp: Recipient already has an active subscription");

    });

    it("Guild: Should fetch approved tokens", async () => {
        expect(await guildA.approvedTokens()).to.have.members([dai.address]);
    });

    it("Guild: Should be able to update subscription price & asset to ETH", async () => {
        await guildA.connect(alice).updateSubscriptionPrice(
            ethers.constants.AddressZero,
            SUBSCRIPTION_PRICE_ETH.toString(),
        );
        const approvedTokens = await guildA.approvedTokens();
        expect(approvedTokens).to.have.members([dai.address, ethers.constants.AddressZero]);
        expect(await guildA.tokenAddress()).to.equal(ethers.constants.AddressZero);
        expect((await guildA.subPrice()).toString()).to.equal(SUBSCRIPTION_PRICE_ETH);

    });

    it("Guild: Should not allow a new subscription with fDAI", async () => {
        const tokenURI = '';
        const tx = guildA.connect(carl).subscribe(carl.address, tokenURI, SUBSCRIPTION_PRICE, "0x");
        await expect(tx).to.be.revertedWith("GuildApp: incorrect msg.value");
    });

    it("EOA Accounts: Should allow new subscriptions using ETH", async () => {
        const balanceBefore = await guildA.guildBalance(ethers.constants.AddressZero);
        const lastTokenId = +(await guildA.totalSupply()).toString() + burnedSubs;
        const tokenURI = '';
        // Carl subscribes to Alice Guild
        const { tokenId } = await testUtils.newSubscription(guildA, carl, tokenURI, SUBSCRIPTION_PRICE_ETH);
        // expect(+tokenId.toString()).to.equal(+lastTokenId.toString() + mintedSubs - burnedSubs);
        // mintedSubs++;

        const subscription = await guildA.subscriptionByOwner(carl.address);
        expect(+subscription.tokenId.toString()).to.equal(+lastTokenId.toString() + 1);

        expect(await guildA.tokenURI(tokenId)).to.equal(`${NFT_BASE_URI}${tokenURI}#${tokenId}`);

        const balanceAfter = await guildA.guildBalance(ethers.constants.AddressZero);

        expect(balanceBefore.add(SUBSCRIPTION_PRICE_ETH)).to.equal(balanceAfter);
    });

    it("Guild: Should be able to withdraw any guild balance", async () => {
        const approvedTokens = await guildA.approvedTokens();
        for(let i = 0; i < approvedTokens.length; i++) {
            const asset = approvedTokens[i];
            let guildBalance = await guildA.guildBalance(asset);
            const balance = asset != ethers.constants.AddressZero 
                ? await dai.balanceOf(guildA.address)
                : await alice.provider!.getBalance(guildA.address);

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
    
    // TODO:
    // GuildApp: Token has not been approved
    // GuildApp: Not enough balance to withdraw
    // GuildApp: Failed to send Ether

    it("Guild: Should not be able to pause the guild by non admin", async () => {
        await expect(guildA.connect(bob).pauseGuild(true)).to.be.revertedWith("GuildApp: Sender doesn't have an Admin role");
    });

    it("Guild: Should be able to pause the guild", async () => {
        await expect(guildA.connect(alice).pauseGuild(true))
            .to.emit(guildA, 'PausedGuild')
            .withArgs(true);
    });

    it("Guild: Should not be able to pause the guild if already in that state", async () => {
        await expect(guildA.connect(alice).pauseGuild(true))
            .to.be.revertedWith("GuildApp: Guild already in that state");
    });

    it("Guild: Should not be able to do any action on a paused guild", async () => {
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
