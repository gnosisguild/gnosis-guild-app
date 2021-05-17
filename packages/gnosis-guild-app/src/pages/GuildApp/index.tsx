import React, { useEffect, useState } from "react";
import styled from "styled-components";

import CreateGuildForm from "../../components/CreateGuildForm";
import GuildAppInstructions from "../../components/GuildAppInstructions";
import GuildStats from "../../components/GuildStats";

import { useGuildContext, GuildProvider } from "../../context/GuildContext";
import { Loader, Title } from "@gnosis.pm/safe-react-components";
import SafeProvider from "@gnosis.pm/safe-apps-react-sdk";

const Grid = styled.div`
  margin-bottom: 2rem;
  width: 100%;
  height: 100%;

  gap: 0rem 4rem;
  display: grid;
  grid-template:
    "form display" 1fr
    / 1fr 1fr;
`;

const GridDisplay = styled.div`
  grid-area: display;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
  align-items: center;
`;

const GuildApp: React.FC = () => {
  const { guildMetadata } = useGuildContext();
  const [displayPanel, setDisplayPanel] = useState(<GuildAppInstructions />);

  useEffect(() => {
    if (guildMetadata.externalLink) {
      setDisplayPanel(<GuildStats />);
    }
  }, [guildMetadata]);

  return (
    <SafeProvider
      loader={
        <>
          <Title size="md">Waiting for Safe...</Title>
          <Loader size="md" />
        </>
      }
    >
      <GuildProvider>
        <Grid>
          <CreateGuildForm />
          <GridDisplay>{displayPanel}</GridDisplay>
        </Grid>
      </GuildProvider>
    </SafeProvider>
  );
};

export default GuildApp;
