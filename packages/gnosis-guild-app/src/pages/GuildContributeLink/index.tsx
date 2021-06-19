import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Button, Text } from "@gnosis.pm/safe-react-components";
import { ethers } from "ethers";

import AmountInput from "../../components/AmountInput";
import ContributorNameInput from "../../components/ContributorNameInput";
import ContributorEmailInput from "../../components/ContributorEmailInput";
import GridLogo from "../../components/GridLogo";
import GuildLogo from "../../components/GuildLogo";

import { fetchSubscriberByGuild } from "../../graphql";
import { useWeb3Context } from "../../context/Web3Context";
import { useGuildContext } from "../../context/GuildContext";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "header" 64px
    "form" 1fr
    "footer" 64px
    / 1fr;
`;

const GridHeader = styled.a`
  grid-area: header;
  background: black;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0.5rem 0.5rem 0rem 0rem;
  text-decoration: none;
`;
const GridForm = styled.div`
  grid-area: form;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const FormItem = styled.div`
  margin: 1rem;
  max-width: 27rem;
  width: 100%;
`;

const ActionButton = styled(Button)`
  grid-area: footer;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: end;

  &&& {
    border-radius: 0rem 0rem 0.5rem 0.5rem;
  }
`;

const GuildLogoSmall = styled(GuildLogo)`
  object-fit: contain;

  &&& {
    height: 48px;
  }
`;

// TODO: Abstract out GuildContribute and reuse here
const GuildContributeLink: React.FC = () => {
  const { connectToWeb3, account, providerChainId } = useWeb3Context();

  const { guildMetadata } = useGuildContext();
  const [activeCurrency, setActiveCurrency] = useState("ETH");

  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");
  const [invalidForm, setInvalidForm] = useState(false);
  const { guildId } = useParams<{ guildId: string }>();
  const [subscribed, setSubscribed] = useState(false);

  const contribute = () => {
    console.log("dummy");
  };

  const contributeText = subscribed ? "Cancel Contribution" : "Contibute";
  const buttonTxt = account ? contributeText : "Connect";

  // TODO: implement unsubscribe
  const unsubscribe = () => {
    console.log("Unsubscribe");
  };

  const contributionTx = subscribed ? unsubscribe : contribute;
  const onClickAction = account ? contributionTx : connectToWeb3;
  useEffect(() => {
    const setSubscriber = async () => {
      if (!guildId || !providerChainId || !account) {
        return;
      }
      const subscribers = await fetchSubscriberByGuild(
        guildId,
        account,
        providerChainId
      );
      if (!subscribers) {
        return;
      }
      if (subscribers.length > 0) {
        setSubscribed(true);
        const subscriber = subscribers[0];
        if (subscriber.paymentHistory.length > 0) {
          const payment = subscriber.paymentHistory[0];
          setGuildMinimumAmount(ethers.utils.formatEther(payment.value));
        }
      }
    };
    setSubscriber();
  });

  return (
    <Grid>
      <GridHeader
        target="_blank"
        href={`${window.location}/guild/1/contribute`}
      >
        <Text size="xl" strong={true} color="white">
          Contribute to {guildMetadata.name} with crypto today
        </Text>
        <GridLogo>
          <GuildLogoSmall />
        </GridLogo>
      </GridHeader>
      <GridForm>
        <FormItem>
          <ContributorNameInput
            name={contributorName}
            setContributorName={setContributorName}
            setInvalidForm={setInvalidForm}
            disabled={subscribed}
          />
        </FormItem>
        <FormItem>
          <ContributorEmailInput
            email={contributorEmail}
            setContributorEmail={setContributorEmail}
            setInvalidForm={setInvalidForm}
            disabled={subscribed}
          />
        </FormItem>
        <FormItem>
          <AmountInput
            title="Monthly Contribution"
            currency={activeCurrency}
            setCurrency={setActiveCurrency}
            amount={guildMinimumAmount}
            setAmount={setGuildMinimumAmount}
            dropdown={false}
            disabled={subscribed}
          />
        </FormItem>
      </GridForm>
      <ActionButton
        size="lg"
        color="secondary"
        onClick={onClickAction}
        disabled={invalidForm}
      >
        {buttonTxt}
      </ActionButton>
    </Grid>
  );
};

export default GuildContributeLink;
