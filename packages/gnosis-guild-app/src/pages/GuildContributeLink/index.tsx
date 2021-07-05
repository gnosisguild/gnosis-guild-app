import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, Loader, Text, Title } from "@gnosis.pm/safe-react-components";

import { APP_DOMAIN } from "../../constants";

import ContributeForm from "../../components/ContributeForm";
import GridLogo from "../../components/GridLogo";
import GuildLogo from "../../components/GuildLogo";

import { useWeb3Context } from "../../context/Web3Context";
import { useGuildContext } from "../../context/GuildContext";

import { useGuildByParams } from "../../hooks/useGuildByParams";
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
  const { connectToWeb3, account, authenticateCeramic } = useWeb3Context();
  const contractGuild = useGuildContext();
  const { contributionTx, contributeText, contributeLoading } = useContribute();

  const [disabledButton, setDisabledButton] = useState(false);
  const [submit, toggleSubmit] = useState(false);
  const [clear, setClear] = useState(false);
  const [invalidForm, setInvalidForm] = useState(false);
  const { guild } = useGuildByParams();

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

  const buttonTxt = account ? contributeText : "Connect";

  const onClickAction = account ? contributionTx : web3connect;

  const guildName = guild ? guild.name : contractGuild.guildMetadata.name;

  useEffect(() => {
    const disabledButton = account ? invalidForm : false;
    setDisabledButton(disabledButton);
  }, [account, invalidForm]);

  return (
    <Grid>
      <GridHeader
        target="_blank"
        href={`${APP_DOMAIN}/#/guild/${guild.guildAddress}`}
      >
        <Text size="xl" strong={true} color="white">
          Contribute to {guildName} with crypto today
        </Text>
        <GridLogo>
          <GuildLogoSmall />
        </GridLogo>
      </GridHeader>
      {guild.name ? (
        <ContributeForm
          setInvalid={setInvalidForm}
          toggleSubmit={toggleSubmit}
          clear={clear}
        />
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
        disabled={disabledButton}
      >
        {buttonTxt}
      </ActionButton>
    </Grid>
  );
};

export default GuildContributeLink;
