import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { Guild, GuildSubscription, Payment } from "../generated/schema";
import {
    InitializedGuild,
    NewSubscription,
    PausedGuild,
    RenewSubscription,
    SubscriptionPriceChanged,
    UpdatedMetadata,
    Withdraw } from "../generated/templates/GuildAppTemplate/GuildApp";

export function handleCreatedGuild(event: InitializedGuild): void {
    let guildId = event.address.toHex();
    log.info("**** Initializing Guild: {}", [guildId]);
    let guild = new Guild(guildId);
    guild.createdAt = event.block.timestamp.toString();
    guild.owner = event.params._creator;
    guild.name = event.params._metadata.name;
    guild.symbol = event.params._metadata.symbol;
    guild.metadataURI = event.params._metadata.baseURI.concat(event.params._metadata.metadataCID);
    guild.active = true;
    guild.tokenAddress = event.params._tokenAddress;
    guild.currentBalance = BigInt.fromI32(0);
    guild.totalSubscriptions = BigInt.fromI32(0);
    guild.subsPeriod = event.params._subscriptionPeriod;
    guild.currentPrice = event.params._subPrice;
    
    guild.save();

}

export function handleUpdatedMetadata(event: UpdatedMetadata): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        guild.metadataURI = event.params._metadataURI;
        guild.save();
    }
}

export function handlePausedGuild(event: PausedGuild):void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        guild.active = event.params._isPaused;
        guild.save();
    }
}

export function handleUpdatedPaymentInfo(event: SubscriptionPriceChanged): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        guild.tokenAddress = event.params._tokenAddress;
        guild.currentPrice = event.params._subPrice;
        guild.save();
    }
}

export function handleNewSubcription(event: NewSubscription): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        let value = event.params._value;
        guild.currentBalance = guild.currentPrice.plus(value);
        guild.totalSubscriptions = guild.totalSubscriptions.plus(value);

        guild.save();

        let keyId = event.params._tokenId;
        let subId = guild.id.concat("-").concat(keyId.toHexString());
        let subscription = new GuildSubscription(subId);
        subscription.createdAt = event.block.timestamp.toString();
        subscription.guild = guild.id;
        subscription.keyId = keyId;
        subscription.owner = event.transaction.from;
        subscription.expires = event.params.expiry.toString();

        subscription.save();

        let paymentId = guild.id
            .concat("-")
            .concat(keyId.toHexString())
            .concat("-")
            .concat(event.params.expiry.toHexString());
        let payment = new Payment(paymentId);
        payment.purchasedAt = event.block.timestamp.toString();
        payment.subscription = subId;
        payment.value = value;

        payment.save();
    }
}

export function handleRenewSubcription(event: RenewSubscription): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        let keyId = event.params._tokenId;
        let subId = event.address.toHexString().concat("-").concat(keyId.toHexString());
        let subscription = GuildSubscription.load(subId);
        // TODO: update Guild balances
        if (subscription != null) {
            let value = event.params._value;
            guild.currentBalance = guild.currentPrice.plus(value);
            guild.totalSubscriptions = guild.totalSubscriptions.plus(value);

            guild.save();

            subscription.expires = event.params.expiry.toString();

            subscription.save();

            let paymentId = subId
                .concat("-")
                .concat(event.params.expiry.toHexString());
            let payment = new Payment(paymentId);
            payment.purchasedAt = event.block.timestamp.toString();
            payment.subscription = subId;
            payment.value = value;

            payment.save();
        }
    }
}

export function handleWithdraw(event: Withdraw): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        let value = event.params._amount;
        guild.currentBalance = guild.currentPrice.minus(value);

        guild.save();
    }
}