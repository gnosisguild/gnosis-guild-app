import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ethers } from "ethers";

import { useWeb3Context } from "../context/Web3Context";
import { useContributorContext } from "../context/ContributorContext";
import { fetchSubscriberByGuild } from "../graphql";

export const useSubscriber = () => {
  const { providerChainId, account, cpk } = useWeb3Context();
  const { guildId } = useParams<{ guildId: string }>();
  const { subscribed, setSubscribed, subscriber, setSubscriber } =
    useContributorContext();

  const [currentMinimumAmount, setCurrentMinimumAmount] = useState("0");
  const [id, setId] = useState("");

  const wrappedSetSubscriber = async (): Promise<void> => {
    if (!guildId || !providerChainId || !account) {
      return;
    }
    const subscribers = await fetchSubscriberByGuild(
      guildId,
      // TODO: should subscriber be the CPK or the owner?
      // cpk?.address || account,
      account,
      providerChainId
    );
    if (!subscribers) {
      console.log("Still False");
      setSubscribed(false);
      return;
    }
    if (subscribers.length > 0) {
      console.log("subscriber True");
      const subscriber = subscribers[0];
      setSubscriber(subscriber);
      if (subscriber.active) {
        setSubscribed(true);
      } else {
        setSubscribed(false);
      }
      setId(subscriber.id);
      if (subscriber.paymentHistory.length > 0) {
        const payment = subscriber.paymentHistory[0];
        setCurrentMinimumAmount(ethers.utils.formatEther(payment.value));
      }
      console.log("Subscriber");
      console.log(subscriber);
    }
  };

  useEffect(() => {
    wrappedSetSubscriber();
  }, [providerChainId, account, guildId]);
  return {
    subscribed,
    currentMinimumAmount,
    id,
    subscriber: subscriber,
    setSubscribed,
    setSubscriber: wrappedSetSubscriber,
  };
};
