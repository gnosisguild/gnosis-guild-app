import { ethers } from "hardhat";
import { BigNumber } from '@ethersproject/bignumber'
import { expect } from "chai";
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { GuildApp } from "../src/types/GuildApp";
import { Erc20Upgradeable } from "../src/types/Erc20Upgradeable";

const SUBSCRIPTION_PERIOD_DEFAULT = 3600 * 24 * 30;

export const newSubscription = async (guild: GuildApp, _subscriber: SignerWithAddress, tokenURI: string, _value: BigNumber, token?: Erc20Upgradeable) => {
    if (token) {
        await token.connect(_subscriber).approve(guild.address, _value);
    }
    const rs = await guild.connect(_subscriber).subscribe(_subscriber.address, tokenURI, _value, "0x", {
        value: token ? "0": _value
    });
    const receipt = await rs.wait();
    const block = await ethers.provider.getBlock(receipt.blockNumber);

    const [ subscriber, tokenId, value, expirationTimestamp ] = receipt?.events?.find(e => e.event === 'NewSubscription')?.args!;
    expect(subscriber).to.equal(_subscriber.address);
    expect(value.toString()).to.equal(_value.toString());
    expect(+expirationTimestamp).to.equal(block.timestamp + SUBSCRIPTION_PERIOD_DEFAULT);

    return {
        tokenId,
        expirationTimestamp,
    };
};

export const verifyNewOwnership = async (guildContract: GuildApp, fromAddress: string, toAddress: string, subscription: {
    subId: any,
    expirationTimestamp: any,
}) => {
    let subs = await guildContract.subscriptionByOwner(fromAddress);
    expect(subs.tokenId.toString()).to.equal('0');
    expect(+subs.expirationTimestamp.toString()).to.equal(0);

    subs = await guildContract.subscriptionByOwner(toAddress);
    expect(subs.tokenId.toString()).to.equal(subscription.subId.toString());
    expect(subs.expirationTimestamp.toString()).to.equal(subscription.expirationTimestamp.toString());

    const newOwner = await guildContract.ownerOf(subscription.subId);
    expect(newOwner).to.equal(toAddress);
}