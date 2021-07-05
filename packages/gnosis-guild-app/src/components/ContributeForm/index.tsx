import { useEffect, useState } from "react";
import { BigNumber, utils } from "ethers";
import { useParams } from "react-router-dom";
import styled from "styled-components";

import { Title } from "@gnosis.pm/safe-react-components";

import AmountInput from "../../components/AmountInput";
import ContributorNameInput from "../../components/ContributorNameInput";
import ContributorEmailInput from "../../components/ContributorEmailInput";

import { useContribute } from "../../hooks/useContribute";
import { useContributorProfile } from "../../hooks/useContributorProfile";
import { useGuildByParams } from "../../hooks/useGuildByParams";
import { useSubscriber } from "../../hooks/useSubscriber";
import { useContributorContext } from "../../context/ContributorContext";
import { useWeb3Context } from "../../context/Web3Context";

import { fetchGuild } from "../../graphql";

type Props = {
  setInvalid: (arg0: boolean) => void;
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
  setInvalid,
  toggleSubmit,
  clear,
  children,
}) => {
  const { providerChainId, connected } = useWeb3Context();
  const { setContributor } = useContributorContext();

  const { profileName, profileEmail } = useContributorProfile();

  const [activeCurrency, setActiveCurrency] = useState("ETH");
  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [invalidForm, setInvalidForm] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");
  const [_, setGuildMetadata] = useState<any>();

  const { guildId } = useParams<{ guildId: string }>();

  // Form validation fields
  const [invalidName, setInvalidName] = useState(false);
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [invalidAmount, setInvalidAmount] = useState(false);

  const { currentMinimumAmount, subscribed, setSubscribed } = useSubscriber();
  const { contributeLoading, setContributeLoading } = useContribute();
  const { guild } = useGuildByParams();

  let name = guild.name;
  if (name && !guild.active) {
    name = `${guild.name} (Inactive)`;
  }
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
      setGuildMinimumAmount(currentMinimumAmount);
    }
  }, [profileName, profileEmail, currentMinimumAmount, connected]);

  useEffect(() => {
    console.log("SettingContributor");
    console.log(contributorName);
    console.log(contributorEmail);
    setContributor(contributorName, contributorEmail, guildMinimumAmount);
  }, [contributorName, contributorEmail, guildMinimumAmount]);

  useEffect(() => {
    if (clear) {
      setContributorName("");
      setContributorEmail("");
      setGuildMinimumAmount("0");
      console.log("Hit clear path");
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

  useEffect(() => {
    setInvalid(
      !providerChainId ||
        contributeLoading ||
        invalidForm ||
        (!subscribed && !guild.active)
    );
  }, [
    providerChainId,
    contributeLoading,
    invalidForm,
    subscribed,
    guild.active,
  ]);

  useEffect(() => {
    // setDisabled
    setDisabled(subscribed || !guild.active);
  }, [subscribed, guild.active]);

  console.log("Subscribed");
  console.log(subscribed);

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
          disabled={disabled}
        />
      </FormItem>
      <FormItem>
        <ContributorEmailInput
          email={contributorEmail}
          setContributorEmail={setContributorEmail}
          setInvalidForm={setInvalidEmail}
          disabled={disabled}
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
          disabled={disabled}
          minimum={guild.amount}
        />
      </FormItem>
      {children}
    </GridForm>
  );
};

export default ContributeForm;