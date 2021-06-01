import React, { useState } from "react";
import styled from "styled-components";
import { Title, Text, TextField } from "@gnosis.pm/safe-react-components";

import ContributorNameInput from "../../components/ContributorNameInput";
import ContributorEmailInput from "../../components/ContributorEmailInput";
import ContributeButton from "../../components/ContributeButton";
import ContributeCard from "../../components/ContributeCard";
import CurrencySelect from "../../components/CurrencySelect";
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
  const { guildMetadata } = useGuildContext();
  const [activeCurrency, setActiveCurrency] = useState("ETH");

  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");

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
          <Text size="xl" strong={true}>
            Monthly Contribution
          </Text>

          <CurrencySelect
            activeId={activeCurrency}
            setActiveCurrency={setActiveCurrency}
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
