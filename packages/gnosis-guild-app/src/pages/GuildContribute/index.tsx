import React, { useState } from "react";
import styled from "styled-components";
import { Title } from "@gnosis.pm/safe-react-components";

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
import { useGuildContext } from "../../context/GuildContext";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "logo form wallet" 1fr
    "footer footer footer" var(--grid-permission-footer-height)
    / 1fr 2fr 1fr;
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
  const { getConnectText } = useWeb3Context();
  const [activeCurrency, setActiveCurrency] = useState("ETH");

  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");
  const [guildMinimumAmount, setGuildMinimumAmount] = useState("0");

  const guildMetadata = {
    name: "Other internet",
    description:
      "Other internet is an independent strategy and research group. Our process is different. We research, prototype, and execute new models for thinking about culture and technology. In doing so we've become responsible for the narrative ducts driving software, money, knowledge, media and culture.",
    contentFormat: "Early access to research essays and Discord community.",
    externalLink: "https://otherinter.net",
    image: "",
    currency: "ETH",
    amount: "1"
  };

  const connectText = getConnectText();
  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      <GridForm>
        <Title size="sm" strong={true}>
          {guildMetadata.name}
        </Title>
        <FormItem>
          <ContributorNameInput
            name={contributorName}
            setContributorName={setContributorName}
          />
        </FormItem>
        <FormItem>
          <ContributorEmailInput
            email={contributorEmail}
            setContributorEmail={setContributorEmail}
          />
        </FormItem>
        <FormItem>
          <AmountInput
            title="Monthly Contribution"
            currency={activeCurrency}
            setCurrency={setActiveCurrency}
            amount={guildMinimumAmount}
            setAmount={setGuildMinimumAmount}
          />
        </FormItem>
        <ContributeCard>
          <ContributeButton>Contibute</ContributeButton>
        </ContributeCard>
      </GridForm>
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
