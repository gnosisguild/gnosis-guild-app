import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Button, Loader, Text, Title } from "@gnosis.pm/safe-react-components";
import { ethers } from "ethers";

import AmountInput from "../../components/AmountInput";
import ContributorNameInput from "../../components/ContributorNameInput";
import ContributorEmailInput from "../../components/ContributorEmailInput";
import GridLogo from "../../components/GridLogo";
import GuildLogo from "../../components/GuildLogo";

import { fetchGuild, fetchSubscriberByGuild } from "../../graphql";
import { useWeb3Context } from "../../context/Web3Context";
import { useGuildContext } from "../../context/GuildContext";
import { useContributorProfile } from "../../hooks/useContributorProfile";
import { useSubscriber } from "../../hooks/useSubscriber";
import { useContribute } from "../../hooks/useContribute";

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

const Loading = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const GuildLogoSmall = styled(GuildLogo)`
  object-fit: contain;

  &&& {
    height: 48px;
  }
`;

// TODO: Abstract out GuildContribute and reuse here
const GuildContributeLink: React.FC = () => {
  const {
    connectToWeb3,
    account,
    providerChainId,
    authenticateCeramic
  } = useWeb3Context();
  const contractGuild = useGuildContext();

  const [activeCurrency, setActiveCurrency] = useState("ETH");

  const [guildMetadata, setGuildMetadata] = useState<any>();
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");
  const [invalidForm, setInvalidForm] = useState(false);
  const { guildId } = useParams<{ guildId: string }>();

  const { profileName, profileEmail } = useContributorProfile();
  const { currentMinimumAmount, subscribed } = useSubscriber();
  const {
    submitContribution,
    contributeLoading,
    setContributeLoading
  } = useContribute();

  const web3connect = async () => {
    connectToWeb3();
    await authenticateCeramic();
  };

  useEffect(() => {
    const ceramicAuth = async () => {
      await authenticateCeramic();
    };
    if (account) {
      ceramicAuth();
    }
  }, [account]);

  // Fetch Guild
  useEffect(() => {
    setContributeLoading(true);
    const _fetchGuild = async () => {
      const meta = await fetchGuild(guildId, providerChainId || 4); // TODO: fetch default Network
      if (meta) {
        setGuildMetadata(meta);
      }
      setContributeLoading(false);
    };
    _fetchGuild();
  }, []);

  const submitContributionTx = async () => {
    await submitContribution(
      guildMetadata.tokenAddress,
      guildMinimumAmount,
      contributorName,
      contributorEmail
    );
  };

  const contributeText = subscribed ? "Cancel Contribution" : "Contibute";
  const buttonTxt = account ? contributeText : "Connect";

  // TODO: implement unsubscribe
  const unsubscribe = () => {
    console.log("Unsubscribe");
  };

  const contributionTx = subscribed ? unsubscribe : submitContributionTx;
  const onClickAction = account ? contributionTx : web3connect;

  useEffect(() => {
    setContributorEmail(profileEmail);
    setContributorName(profileName);
  }, [profileName, profileEmail]);

  useEffect(() => {
    setGuildMinimumAmount(currentMinimumAmount);
  }, [currentMinimumAmount]);

  const guildName = guildMetadata
    ? guildMetadata.name
    : contractGuild.guildMetadata.name;

  return (
    <Grid>
      <GridHeader
        target="_blank"
        href={`${window.location}/guild/1/contribute`}
      >
        <Text size="xl" strong={true} color="white">
          Contribute to {guildName} with crypto today
        </Text>
        <GridLogo>
          <GuildLogoSmall />
        </GridLogo>
      </GridHeader>
      {guildMetadata ? (
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
      ) : (
        <Loading>
          {contributeLoading ? (
            <Loader size="md" />
          ) : (
            <Title size="sm" strong={true}>
              404: Guild not found
            </Title>
          )}
        </Loading>
      )}
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
