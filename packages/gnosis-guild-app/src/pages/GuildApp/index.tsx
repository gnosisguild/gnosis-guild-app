import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Loader } from "@gnosis.pm/safe-react-components";

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
    "_ _" 1fr
    "form display" 2fr
    "left right" 1fr
    / 1fr 1fr;
`;

const GridDisplay = styled.div`
  grid-area: display;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  // This must match the form margin
  padding-top: 0.8rem;
  max-width: 600px;
  align-items: center;
`;

const Loading = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const GuildApp: React.FC = () => {
  const { loading, guildMetadata } = useGuildContext();
  const [displayPanel, setDisplayPanel] = useState(<GuildAppInstructions />);

  useEffect(() => {
    const fetchGuild = () => {
      const guild = guildMetadata.active ? true : false;
      if (guild) {
        setDisplayPanel(<GuildStats />);
      } else {
        setDisplayPanel(<GuildAppInstructions />);
      }
    };
    fetchGuild();
  }, [guildMetadata.active]);

  // Get reference to image
  console.log("Inspect", loading, guildMetadata);

  return loading ? (
    <Loading>
      <Loader size="md" />
    </Loading>
  ) : (
    <Grid>
      <CreateGuildForm />
      <GridDisplay>{displayPanel}</GridDisplay>
    </Grid>
  );
};

export default GuildApp;
// Fix loading windows
