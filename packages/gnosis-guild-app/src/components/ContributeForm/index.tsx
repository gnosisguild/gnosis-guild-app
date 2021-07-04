import { useEffect, useState } from "react";
import { BigNumber, utils } from "ethers";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { Title } from "@gnosis.pm/safe-react-components";

import AmountInput from "../../components/AmountInput";
import ContributeButton from "../../components/ContributeButton";
import ContributeCard from "../../components/ContributeCard";
import ContributorNameInput from "../../components/ContributorNameInput";
import ContributorEmailInput from "../../components/ContributorEmailInput";

import { useContribute } from "../../hooks/useContribute";
import { useContributorProfile } from "../../hooks/useContributorProfile";
import { useGuildByParams } from "../../hooks/useGuildByParams";
import { useSubscriber } from "../../hooks/useSubscriber";
import { useWeb3Context } from "../../context/Web3Context";

import { fetchGuild } from "../../graphql";

type Props = {
  disabled: boolean;
  setModalFooter: (arg0: string) => void;
  toggleSubmit: (arg0: boolean) => void;
  clear?: boolean;
};

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

const ContributeForm: React.FC<Props> = ({
  disabled,
  setModalFooter,
  toggleSubmit,
  clear,
}) => {
  const {
    account,
    getBalanceOf,
    getProxyBalance,
    providerChainId,
    cpk,
    connected,
  } = useWeb3Context();
  const {
    submitContribution,
    contributeLoading,
    unsubscribe,
    setContributeLoading,
  } = useContribute();

  const { profileName, profileEmail } = useContributorProfile();

  const [activeCurrency, setActiveCurrency] = useState("ETH");
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [invalidForm, setInvalidForm] = useState(false);
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");
  const [guildMetadata, setGuildMetadata] = useState<any>();

  const { guildId } = useParams<{ guildId: string }>();

  // Form validation fields
  const [invalidName, setInvalidName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidAmount, setInvalidAmount] = useState(false);

  const { currentMinimumAmount, subscribed, setSubscribed } = useSubscriber();
  const { guild } = useGuildByParams();

  let name = guild.name;
  if (name && !guild.active) {
    name = `${guild.name} (Inactive)`;
  }

  const submitContributionTx = async () => {
    setModalFooter(
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

    if (balance.lt(bnValue) && cpk?.address && proxyBalance.lt(bnValue)) {
      // TODO: popup error
      console.error("Not Enough balance");
      setModalFooter("Tx Failed. Not Enough Balance!");
      return;
    }

    await submitContribution(
      guildMetadata.tokenAddress,
      guildMinimumAmount,
      contributorName,
      contributorEmail
    );
    toggleSubmit(false);
    setSubscribed(true);
  };

  const unsubscribeTx = async () => {
    setModalFooter("Cancelling Subscription...");
    toggleSubmit(true);
    const tx = await unsubscribe(guild.guildAddress);
    setContributeLoading(true);
    if (tx) {
      await tx.wait();
    }
    toggleSubmit(false);
  };

  const contributionTx = subscribed ? unsubscribeTx : submitContributionTx;
  const contributeText = subscribed ? "Cancel Contribution" : "Contribute";

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

  useEffect(() => {
    if (connected) {
      setContributorEmail(profileEmail);
      setContributorName(profileName);
    }
  }, [profileName, profileEmail, connected]);

  useEffect(() => {
    console.log("Conencted");
    console.log(connected);
    if (connected) {
      setGuildMinimumAmount(currentMinimumAmount);
    }
  }, [currentMinimumAmount, connected]);

  useEffect(() => {
    if (clear) {
      setContributorName("");
      setContributorEmail("");
      setGuildMinimumAmount("0");
      setSubscribed(false);
    }
  }, [clear]);

  // Form validation
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

  return (
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
            disabled ||
            !providerChainId ||
            contributeLoading ||
            invalidForm ||
            (!subscribed && !guild.active)
          }
        >
          {!contributeLoading ? contributeText : "Sending Contribution..."}
        </ContributeButton>
      </ContributeCard>
    </GridForm>
  );
};

export default ContributeForm;
