import React, { useState } from "react";
import styled from "styled-components";
import { Button, Text, TextField } from "@gnosis.pm/safe-react-components";

import CurrencySelect from "../../components/CurrencySelect";
import GridLogo from "../../components/GridLogo";
import GuildLogo from "../../components/GuildLogo";

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

// Make contribute the connect button at first
// Abstract form to shared component
// make header and add responsiveness to become single bar after
// a period of time
const GuildContributeLink: React.FC = () => {
  const { connectToWeb3, account } = useWeb3Context();

  const { guildMetadata } = useGuildContext();
  const [activeCurrency, setActiveCurrency] = useState("ETH");

  const [contributorName, setContributorName] = useState("");
  const [contributorEmail, setContributorEmail] = useState("");

  const contribute = () => {
    console.log("dummy");
  };

  const onClickAction = account ? contribute : connectToWeb3;
  const buttonTxt = account ? "Contribute" : "Connect";

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
          <Text size="xl" strong={true}>
            Name
          </Text>
          <TextField
            label="50 characters"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
          />
        </FormItem>
        <FormItem>
          <Text size="xl" strong={true}>
            Email
          </Text>
          <TextField
            label="200 characters"
            value={contributorEmail}
            onChange={(e) => setContributorEmail(e.target.value)}
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
      </GridForm>
      <ActionButton size="lg" color="secondary" onClick={onClickAction}>
        {buttonTxt}
      </ActionButton>
    </Grid>
  );
};

export default GuildContributeLink;
