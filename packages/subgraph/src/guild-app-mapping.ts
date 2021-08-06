import { BigInt, log } from "@graphprotocol/graph-ts";
import { Guild, GuildBalance, GuildSubscription, Payment, GuildWithdrawal } from "../generated/schema";
import {
    GuildApp,
    InitializedGuild,
    NewSubscription,
    PausedGuild,
    RenewSubscription,
    SubscriptionPriceChanged,
    UpdatedMetadata,
    Unsubscribed,
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
    guild.lastMetadataUpdate = event.block.timestamp.toString();
    guild.active = true;
    guild.tokenAddress = event.params._tokenAddress;
    guild.totalSubscribers = BigInt.fromI32(0);
    guild.subsPeriod = event.params._subscriptionPeriod;
    guild.currentPrice = event.params._subPrice;
    
    guild.save();

    let balanceId = guildId.concat("-").concat(guild.tokenAddress.toHexString());
    let guildBalance = new GuildBalance(balanceId);
    guildBalance.guild = guildId;
    guildBalance.addedAt = event.block.timestamp.toString();
    guildBalance.tokenAddress = guild.tokenAddress;
    guildBalance.currentBalance = BigInt.fromI32(0);
    guildBalance.totalSubscriptions = BigInt.fromI32(0);

    guildBalance.save();

}

export function handleUpdatedMetadata(event: UpdatedMetadata): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        guild.metadataURI = event.params._metadataURI;
        guild.lastMetadataUpdate = event.block.timestamp.toString();
        guild.save();
    }
}

export function handlePausedGuild(event: PausedGuild):void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        guild.active = !event.params._isPaused;
        guild.pausedAt = event.params._isPaused ? event.block.timestamp.toString() : null;
        guild.save();
    }
}

export function handleUpdatedPaymentInfo(event: SubscriptionPriceChanged): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        guild.tokenAddress = event.params._tokenAddress;
        guild.currentPrice = event.params._subPrice;
        guild.save();

        let balanceId = guild.id.concat("-").concat(guild.tokenAddress.toHexString());
        let guildBalance = GuildBalance.load(balanceId);
        if (guildBalance == null) {
            let guildBalance = new GuildBalance(balanceId);
            guildBalance.guild = guild.id;
            guildBalance.addedAt = event.block.timestamp.toString();
            guildBalance.tokenAddress = guild.tokenAddress;
            guildBalance.currentBalance = BigInt.fromI32(0);
            guildBalance.totalSubscriptions = BigInt.fromI32(0);

            guildBalance.save();

        }
    }
}

export function handleNewSubcription(event: NewSubscription): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        let value = event.params._value;
        guild.totalSubscribers = guild.totalSubscribers.plus(BigInt.fromI32(1));

        guild.save();

        let balanceId = guild.id.concat("-").concat(guild.tokenAddress.toHexString());
        let guildBalance = GuildBalance.load(balanceId);
        // TODO: update balances based on what's transferred through Recurring Allowances module
        guildBalance.currentBalance = guildBalance.currentBalance.plus(value);
        guildBalance.totalSubscriptions = guildBalance.totalSubscriptions.plus(value);

        guildBalance.save();

        let keyId = event.params._tokenId;
        // let owner = event.transaction.from;
        let owner = event.params._subscriber;
        let subId = guild.id.concat("-").concat(keyId.toHexString());
        let subscription = new GuildSubscription(subId);
        subscription.createdAt = event.block.timestamp.toString();
        subscription.active = true;
        subscription.guild = guild.id;
        subscription.keyId = keyId;
        subscription.owner = owner;
        subscription.expires = event.params.expiry.toString();

        subscription.save();

        let paymentId = guild.id
            .concat("-")
            .concat(owner.toHexString())
            .concat("-")
            .concat(event.params.expiry.toHexString());
        let payment = new Payment(paymentId);
        payment.purchasedAt = event.block.timestamp.toString();
        payment.subscription = subId;
        payment.token = guild.tokenAddress;
        payment.value = value;
        // TODO: set signature if sent by a Gnosis Proxy Contract with Allowance module
        payment.transferSignature = event.params._data;

        payment.save();
    }
}

export function handleRenewSubcription(event: RenewSubscription): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        let keyId = event.params._tokenId;
        let subId = guild.id.concat("-").concat(keyId.toHexString());
        let subscription = GuildSubscription.load(subId);
        if (subscription != null) {
            let value = event.params._value;

            let balanceId = guild.id.concat("-").concat(guild.tokenAddress.toHexString());
            let guildBalance = GuildBalance.load(balanceId);
            // TODO: update balances based on what's transferred through Recurring Allowances module
            guildBalance.currentBalance = guildBalance.currentBalance.plus(value);
            guildBalance.totalSubscriptions = guildBalance.totalSubscriptions.plus(value);

            guildBalance.save();

            subscription.expires = event.params.expiry.toString();

            subscription.save();

            let paymentId = subId
                .concat("-")
                .concat(event.params.expiry.toHexString());
            let payment = new Payment(paymentId);
            payment.purchasedAt = event.block.timestamp.toString();
            payment.subscription = subId;
            payment.token = guild.tokenAddress;
            payment.value = value;
            // TODO: set signature if sent by a Gnosis Proxy Contract with Allowance module
            payment.transferSignature = event.params._data;

            payment.save();
        }
    }
}

export function handleUnsubscription(event: Unsubscribed): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        // let value = event.params._value;
        guild.totalSubscribers = guild.totalSubscribers.minus(BigInt.fromI32(1));

        guild.save();

        let keyId = event.params._tokenId;
        let subId = guild.id.concat("-").concat(keyId.toHexString());
        let subscription = GuildSubscription.load(subId);
        if (subscription != null) {
            subscription.active = false;
            subscription.unsubscribedAt = event.block.timestamp.toString();
            // subscription.keyId = BigInt.fromI32(0); // TODO: correct approach?
            subscription.save();
        }

    }
}

export function handleWithdraw(event: Withdraw): void {
    let guild = Guild.load(event.address.toHex());
    if (guild != null) {
        let tokenAddress = event.params._tokenAddress;
        let value = event.params._amount;
        let balanceId = guild.id.concat("-").concat(tokenAddress.toHexString());
        let guildBalance = GuildBalance.load(balanceId);
        guildBalance.currentBalance = guildBalance.currentBalance.minus(value);

        guildBalance.save();

        let withdrawal = new GuildWithdrawal(event.transaction.hash.toHexString());
        withdrawal.guild = guild.id;
        withdrawal.tokenAddress = tokenAddress;
        withdrawal.value = value;
        withdrawal.beneficiary = event.params.beneficiary;

        withdrawal.save();
    }
}