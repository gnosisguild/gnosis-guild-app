import React, { useEffect, useState } from "react";
import styled from "styled-components";

import CreateGuildForm from "../../components/CreateGuildForm";
import GuildAppInstructions from "../../components/GuildAppInstructions";
import GuildStats from "../../components/GuildStats";

import { useGuildContext } from "../../context/GuildContext";

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
    const fetchGuild = async () => {
      const guild = guildMetadata.guildAddress ? true : false;
      if (guild) {
        setDisplayPanel(<GuildStats />);
      }
    };
    fetchGuild();
  }, [guildMetadata.guildAddress]);

  // Get reference to image

  return (
    <Grid>
      <CreateGuildForm />
      <GridDisplay>{displayPanel}</GridDisplay>
    </Grid>
  );
};

export default GuildApp;
