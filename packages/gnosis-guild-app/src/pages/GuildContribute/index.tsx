import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { Loader, Title } from "@gnosis.pm/safe-react-components";

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
import { fetchGuild } from "../../graphql";
import { useSubscriber } from "../../hooks/useSubscriber";
import { useContributorProfile } from "../../hooks/useContributorProfile";
import { useContribute } from "../../hooks/useContribute";
import { useGuildByParams } from "../../hooks/useGuildByParams";

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
  const { getConnectText, providerChainId } = useWeb3Context();
  const [activeCurrency, setActiveCurrency] = useState("ETH");

  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");
  const [invalidForm, setInvalidForm] = useState(false);
  const { loading, guild } = useGuildByParams();

  const [guildMetadata, setGuildMetadata] = useState<any>();
  const { guildId } = useParams<{ guildId: string }>();
  // console.log("GUILD ID ==>", guildId, providerChainId);
  const { currentMinimumAmount, subscribed } = useSubscriber();
  const { profileName, profileEmail } = useContributorProfile();
  const { submitContribution, contributeLoading, setContributeLoading } =
    useContribute();

  useEffect(() => {
    setContributorEmail(profileEmail);
    setContributorName(profileName);
  }, [profileName, profileEmail]);

  useEffect(() => {
    setGuildMinimumAmount(currentMinimumAmount);
  }, [currentMinimumAmount]);

  const connectText = getConnectText();
  const contributeText = subscribed ? "Cancel Contribution" : "Contibute";

  // TODO: implement unsubscribe
  const unsubscribe = () => {
    console.log("Unsubscribe");
  };
  const submitContributionTx = async () => {
    if (!guild.tokenAddress) {
      console.error("No token address");
      return;
    }
    await submitContribution(
      guild.tokenAddress,
      guildMinimumAmount,
      contributorName,
      contributorEmail
    );
  };

  const onDisconnect = () => {
    setContributorName("");
    setContributorEmail("");
    setGuildMinimumAmount("0");
  };

  const contributionTx = subscribed ? unsubscribe : submitContributionTx;
  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      {guild.name ? (
        <GridForm>
          <Title size="sm" strong={true}>
            {guild.name}
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
              disabled={!providerChainId || contributeLoading || invalidForm}
            >
              {!contributeLoading ? contributeText : "Sending Contribution..."}
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
        <ConnectWeb3Button disconnectAction={onDisconnect}>
          {connectText}
        </ConnectWeb3Button>
      </GridWallet>
      <GridAgreementFooter>
        <RiskAgreement />
      </GridAgreementFooter>
    </Grid>
  );
};

export default GuildContribute;
