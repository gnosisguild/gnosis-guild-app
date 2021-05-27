import { BigInt, Address, log } from "@graphprotocol/graph-ts";
import { Guild, Subscription, Payment } from "../generated/schema";
import {
    InitializeCall,
    NewSubscription,
    PausedGuild,
    RenewSubscription,
    SubscriptionPriceChanged,
    UpdatedMetadata,
    Withdraw } from "../generated/templates/GuildAppTemplate/GuildApp";

export function handleCreateGuild(call: InitializeCall): void {
    let guildId = call.to.toHexString();
    let guild = new Guild(guildId);
    guild.createdAt = call.block.timestamp.toString();
    guild.owner = call.inputs._creator;
    guild.name = call.inputs._metadata.name;
    guild.symbol = call.inputs._metadata.symbol;
    guild.metadataURI = call.inputs._metadata.baseURI.concat(call.inputs._metadata.metadataCID);
    guild.active = true;
    guild.tokenAddress = call.inputs._tokenAddress;
    guild.currentBalance = BigInt.fromI32(0);
    guild.totalSubscriptions = BigInt.fromI32(0);
    guild.subsPeriod = call.inputs._subscriptionPeriod;
    guild.currentPrice = call.inputs._subPrice;
    
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
        let subscription = new Subscription(subId);
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
        let subscription = Subscription.load(subId);
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