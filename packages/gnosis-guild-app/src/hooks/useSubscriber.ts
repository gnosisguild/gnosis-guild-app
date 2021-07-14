import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCallback } from "react";
import { ethers } from "ethers";

import { useWeb3Context } from "../context/Web3Context";
import { useContributorContext } from "../context/ContributorContext";
import { fetchSubscriberByGuild, GraphSubscriber } from "../graphql";

type Subscriber = {
  subscribed: boolean;
  currentMinimumAmount: string;
  id: string;
  subscriber: GraphSubscriber;
  setSubscriber: () => Promise<void>;
  setSubscribed: (arg0: boolean) => void;
};

export const useSubscriber = (): Subscriber => {
  const { account, /*cpk,*/ providerChainId } = useWeb3Context();
  const { guildId } = useParams<{ guildId: string }>();
  const { subscribed, setSubscribed, subscriber, setSubscriber } =
    useContributorContext();

  const [currentMinimumAmount, setCurrentMinimumAmount] = useState("0");
  const [id, setId] = useState("");

  const wrappedSetSubscriber = useCallback(async (): Promise<void> => {
    if (!guildId || !providerChainId || !account) {
      return;
    }
    // TODO: should subscriber be the CPK or the owner?
    // const subscriberAddress = cpk?.address || account;
    const subscriberAddress = account;
    const subscribers = await fetchSubscriberByGuild(
      guildId,
      subscriberAddress.toLowerCase(),
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
  }, [account, guildId, providerChainId, setSubscribed, setSubscriber]);

  useEffect(() => {
    wrappedSetSubscriber();
  }, [wrappedSetSubscriber]);
  return {
    subscribed,
    currentMinimumAmount,
    id,
    subscriber,
    setSubscribed,
    setSubscriber: wrappedSetSubscriber,
  };
};
