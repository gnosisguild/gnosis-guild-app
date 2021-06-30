import { BigNumber, utils } from "ethers";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { GenericModal, Loader, Title } from "@gnosis.pm/safe-react-components";

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
import { fetchGuild, fetchSubscription } from "../../graphql";
import { useSubscriber } from "../../hooks/useSubscriber";
import { useContributorProfile } from "../../hooks/useContributorProfile";
import { useContribute } from "../../hooks/useContribute";
import { useGuildByParams } from "../../hooks/useGuildByParams";
import { useRiskAgreement } from "../../hooks/useRiskAgreement";

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

const GuildLoaderContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const TransactionLoader = (
  <GuildLoaderContainer>
    <Loader size="lg" />
  </GuildLoaderContainer>
);

const GuildContribute: React.FC = () => {
  const {
    account,
    getBalanceOf,
    getConnectText,
    getProxyBalance,
    providerChainId,
    cpk,
  } = useWeb3Context();
  const [activeCurrency, setActiveCurrency] = useState("ETH");
  const { riskAgreement, setRiskAgreement } = useRiskAgreement();

  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");
  const [invalidForm, setInvalidForm] = useState(false);
  const [invalidName, setInvalidName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidAmount, setInvalidAmount] = useState(false);
  const { loading, guild } = useGuildByParams();

  const [guildMetadata, setGuildMetadata] = useState<any>();
  const [subscription, setSubscription] = useState<any>();
  const [submit, toggleSubmit] = useState(false);
  const [footerMsg, setFooterMsg] = useState("");
  // const [ contributeText, setContributeText ] = useState("");
  const { guildId } = useParams<{ guildId: string }>();
  // console.log("GUILD ID ==>", guildId, providerChainId);
  const { currentMinimumAmount, subscribed, subscriber } = useSubscriber();
  const { profileName, profileEmail } = useContributorProfile();
  const {
    submitContribution,
    contributeLoading,
    unsubscribe,
    setContributeLoading,
  } = useContribute();
  console.log(subscribed);
  console.log(guild.active);

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

  const _fetchSubscription = async () => {
    console.log("Using Guild owner =>", cpk?.address || account);
    const _subscription = await fetchSubscription(
      guildId,
      cpk?.address || account,
      providerChainId || 4
    );
    console.log("Subscription exists?", _subscription);
    setSubscription(_subscription);
  };
  useEffect(() => {
    if (guildMetadata) {
      _fetchSubscription();
    }
  }, [guildMetadata, cpk]);

  useEffect(() => {
    setContributorEmail(profileEmail);
    setContributorName(profileName);
  }, [profileName, profileEmail]);

  useEffect(() => {
    setGuildMinimumAmount(currentMinimumAmount);
  }, [currentMinimumAmount]);

  const connectText = getConnectText();
  const contributeText = subscribed ? "Cancel Contribution" : "Contibute";
  // useEffect(() => {
  //   setContributeText(subscribed ? "Cancel Contribution" : "Contibute");
  // }, [subscription, subscribed]);

  // TODO: implement unsubscribe
  const unsubscribeTx = async () => {
    setFooterMsg("Cancelling Subscription...");
    toggleSubmit(true);
    const tx = await unsubscribe(guild.guildAddress);
    setContributeLoading(true);
    if (tx) {
      await tx.wait();
    }
    toggleSubmit(false);
  };

  const submitContributionTx = async () => {
    setFooterMsg(
      cpk
        ? "Creating Subscription using a Proxy..."
        : "Approving tokens & creating subscription..."
    );
    toggleSubmit(true);

    const bnValue = utils.parseEther(guildMinimumAmount);
    const proxyBalance = cpk?.address
      ? await getProxyBalance(guildMetadata.tokenAddress)
      : BigNumber.from("0");
    const balance = await getBalanceOf(account, guildMetadata.tokenAddress);

    if (balance.lt(bnValue) || (cpk?.address && proxyBalance.lt(bnValue))) {
      // TODO: popup error
      console.error("Not Enough balance");
      return;
    }

    await submitContribution(
      guildMetadata.tokenAddress,
      guildMinimumAmount,
      contributorName,
      contributorEmail
    );
    _fetchSubscription();
    toggleSubmit(false);
  };

  useEffect(() => {
    if (
      !contributorEmail ||
      !contributorName ||
      guildMinimumAmount === "0" ||
      invalidName ||
      invalidEmail ||
      invalidAmount
    ) {
      setInvalidForm(true);
    } else {
      setInvalidForm(false);
    }
  }, [
    contributorEmail,
    contributorName,
    guildMinimumAmount,
    invalidName,
    invalidAmount,
    invalidEmail,
  ]);

  const onDisconnect = () => {
    setContributorName("");
    setContributorEmail("");
    setGuildMinimumAmount("0");
  };

  let name = guild.name;
  if (name && !guild.active) {
    name = `${guild.name} (Inactive)`;
  }

  const contributionTx = subscribed ? unsubscribeTx : submitContributionTx;
  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      {guild.name ? (
        <GridForm>
          <Title size="sm" strong={true}>
            {name}
          </Title>
          <FormItem>
            <ContributorNameInput
              name={contributorName}
              setContributorName={setContributorName}
              setInvalidForm={setInvalidName}
              disabled={subscribed || !guild.active}
            />
          </FormItem>
          <FormItem>
            <ContributorEmailInput
              email={contributorEmail}
              setContributorEmail={setContributorEmail}
              setInvalidForm={setInvalidEmail}
              disabled={subscribed || !guild.active}
            />
          </FormItem>
          <FormItem>
            <AmountInput
              title="Monthly Contribution"
              currency={guild?.currency || activeCurrency}
              setCurrency={setActiveCurrency}
              amount={guildMinimumAmount}
              setAmount={setGuildMinimumAmount}
              setInvalidForm={setInvalidAmount}
              dropdown={false}
              disabled={subscribed || !guild.active}
              minimum={guild.amount}
            />
          </FormItem>
          <ContributeCard>
            <ContributeButton
              onClick={contributionTx}
              disabled={
                !providerChainId ||
                contributeLoading ||
                invalidForm ||
                (!subscribed && !guild.active) ||
                !riskAgreement
              }
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
      <GridAgreementFooter visible={!riskAgreement}>
        <RiskAgreement onClick={setRiskAgreement} />
      </GridAgreementFooter>
      {submit && (
        <GenericModal
          onClose={() => toggleSubmit(!submit)}
          title="Executing Transaction"
          body={TransactionLoader}
          footer={footerMsg}
        />
      )}
    </Grid>
  );
};

export default GuildContribute;
