import React, { useCallback, useContext, useState } from "react";

import { GraphSubscriber, Payment } from "../graphql";

export type ContributerContextValue = {
  email: string;
  name: string;
  subscribed: boolean;
  subscriber: GraphSubscriber;
  guildMinimumAmount: string;
  setContributor: (arg0: string, arg1: string, arg2: string) => void;
  setSubscriber: (arg0: GraphSubscriber) => void;
  setSubscribed: (arg0: boolean) => void;
};

const initialSubscriber = {
  id: "",
  active: false,
  unsubscribedAt: "",
  owner: "",
  paymentHistory: [] as Array<Payment>,
  keyId: 0,
};

const initialContributionData = {
  email: "",
  name: "",
  subscribed: false,
  subscriber: {
    id: "",
    active: false,
    unsubscribedAt: "",
    owner: "",
    paymentHistory: [],
    keyId: 0,
  },
  guildMinimumAmount: "0",
  setContributor: (name: string, email: string, guildMinimumAmount: string) => {
    name;
    email;
    guildMinimumAmount;
  },
  setSubscriber: (subscriber: GraphSubscriber) => {
    subscriber;
  },
  setSubscribed: (subscribed: boolean) => {
    subscribed;
  },
};

export const ContributorContext = React.createContext<ContributerContextValue>(
  initialContributionData
);

export const useContributorContext: () => ContributerContextValue = () =>
  useContext(ContributorContext);

export const ContributorProvider: React.FC = ({ children }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [guildMinimum, setGuildMinimum] = useState("0");
  const [subscriber, setSubscriber] = useState(initialSubscriber);
  const setContributor = useCallback(
    (name: string, email: string, guildMinimum: string) => {
      setName(name);
      setEmail(email);
      setGuildMinimum(guildMinimum);
    },
    []
  );
  const memoizedSetSubscribed = useCallback((subscribed: boolean) => {
    setSubscribed(subscribed);
  }, []);

  const memoizedSetSubscriber = useCallback((subscriber: GraphSubscriber) => {
    setSubscriber(subscriber);
  }, []);
  return (
    <ContributorContext.Provider
      value={{
        name,
        email,
        subscribed,
        subscriber,
        guildMinimumAmount: guildMinimum,
        setContributor,
        setSubscriber: memoizedSetSubscriber,
        setSubscribed: memoizedSetSubscribed,
      }}
    >
      {children}
    </ContributorContext.Provider>
  );
};
