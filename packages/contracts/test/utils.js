const { expect } = require("chai");

module.exports.verifyNewOwnership = async (guildContract, fromAddress, toAddress, subscription) => {
    let subs = await guildContract.subscriptionByOwner(fromAddress);
    expect(subs.tokenId.toString()).to.equal('0');
    expect(+subs.expirationTimestamp.toString()).to.equal(0);

    subs = await guildContract.subscriptionByOwner(toAddress);
    expect(subs.tokenId.toString()).to.equal(subscription.subId.toString());
    expect(subs.expirationTimestamp.toString()).to.equal(subscription.expirationTimestamp.toString());

    const newOwner = await guildContract.ownerOf(subscription.subId);
    expect(newOwner).to.equal(toAddress);
}