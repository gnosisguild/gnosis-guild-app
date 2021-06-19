import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Loader, Title } from "@gnosis.pm/safe-react-components";
import { ethers } from "ethers";

import AmountInput from "../../components/AmountInput";
import ContributorNameInput from "../../components/ContributorNameInput";
import ContributorEmailInput from "../../components/ContributorEmailInput";
import ContributeButton from "../../components/ContributeButton";
import ContributeCard from "../../components/ContributeCard";
import GridAgreementFooter from "../../components/GridAgreementFooter";
import GridLogo from "../../components/GridLogo";
import GridWallet from "../../components/GridWallet";
import GuildLogo from "../../components/GuildLogo";
import RiskAgreement from "../../components/RiskAgreement";
import ConnectWeb3Button from "../../components/ConnectWeb3Button";
import { useWeb3Context } from "../../context/Web3Context";
import { fetchGuild, fetchSubscriberByGuild } from "../../graphql";
import { useGuild } from "../../hooks/useGuild";
import { ContributorProfile } from "../../types";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "logo form wallet" 1fr
    "footer footer footer" var(--grid-permission-footer-height)
    / 1fr 2fr 1fr;
`;

const Loading = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const GridForm = styled.div`
  grid-area: form;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FormItem = styled.div`
  margin: 1rem;
  max-width: 27rem;
  width: 100%;
`;

const GuildContribute: React.FC = () => {
  const {
    ethersProvider,
    getConnectText,
    providerChainId,
    idx,
    did,
    account
  } = useWeb3Context();
  const [activeCurrency, setActiveCurrency] = useState("ETH");

  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");
  const [invalidForm, setInvalidForm] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const { subscribe } = useGuild();
  const [loading, setLoading] = useState(true);
  const [guildMetadata, setGuildMetadata] = useState<any>();
  const { guildId } = useParams<{ guildId: string }>();
  console.log("GUILD ID ==>", guildId, providerChainId);

  const submitContribution = async () => {
    setLoading(true);
    try {
      await subscribe(
        providerChainId,
        ethersProvider,
        guildId,
        guildMetadata?.tokenAddress,
        guildMinimumAmount,
        {
          name: contributorName,
          email: contributorEmail
        }
      );
    } catch (error) {
      // TODO: Show an pop-up error
    }
    await saveContributorProfile();
    setLoading(false);
  };

  const saveContributorProfile = async () => {
    console.log("DID");
    console.log(did?.id);
    const recipients = [
      did?.id as string,
      "did:key:z6MkuCGtjBKamt3RaLSjGYcViKYRrmaH7BAavD6o6CESoQBo" // Server DID
    ];
    const record = await did?.createDagJWE(
      {
        name: contributorName,
        email: contributorEmail,
        address: account
      },
      recipients
    );

    if (record) {
      const r = await idx
        ?.set("contributorProfile", { profile: record })
        .catch(err => console.error(`Failed to save: ${err}`));
    }
  };

  const setContributorProfile = async () => {
    if (!did) {
      return;
    }
    const encryptedProfile = (await idx?.get(
      "contributorProfile",
      did.id
    )) as any;
    if (!encryptedProfile) {
      return;
    }
    const profile = (await did?.decryptDagJWE(
      encryptedProfile.profile
    )) as ContributorProfile;
    if (profile) {
      if (!contributorName) {
        setContributorName(profile.name);
      }
      if (!contributorEmail) {
        setContributorEmail(profile.email);
      }
    }
  };

  // Fetch Guild
  useEffect(() => {
    const _fetchGuild = async () => {
      const meta = await fetchGuild(guildId, providerChainId || 4); // TODO: fetch default Network
      if (meta) {
        setGuildMetadata(meta);
      }
      setLoading(false);
    };
    _fetchGuild();
  }, []);

  // Set Idx ContributorProfile
  useEffect(() => {
    const setProfile = async () => {
      await setContributorProfile();
    };
    if (idx) {
      setProfile();
    }
  }, [idx]);

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

  const connectText = getConnectText();
  const contributeText = subscribed ? "Cancel Contribution" : "Contibute";

  // TODO: implement unsubscribe
  const unsubscribe = () => {
    console.log("Unsubscribe");
  };
  const contributionTx = subscribed ? unsubscribe : submitContribution;
  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      {guildMetadata ? (
        <GridForm>
          <Title size="sm" strong={true}>
            {guildMetadata.name}
          </Title>
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
          <ContributeCard>
            <ContributeButton
              onClick={contributionTx}
              disabled={!providerChainId || loading || invalidForm}
            >
              {!loading ? contributeText : "Sending Contribution..."}
            </ContributeButton>
          </ContributeCard>
        </GridForm>
      ) : (
        <Loading>
          {loading ? (
            <Loader size="md" />
          ) : (
            <Title size="sm" strong={true}>
              404: Guild not found
            </Title>
          )}
        </Loading>
      )}
      <GridWallet>
        <ConnectWeb3Button>{connectText}</ConnectWeb3Button>
      </GridWallet>
      <GridAgreementFooter>
        <RiskAgreement />
      </GridAgreementFooter>
    </Grid>
  );
};

export default GuildContribute;
