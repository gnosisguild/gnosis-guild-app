import React, { useEffect, useState } from "react";
import styled from "styled-components";

import CreateGuildForm from "../../components/CreateGuildForm";
import GuildAppInstructions from "../../components/GuildAppInstructions";
import GuildStats from "../../components/GuildStats";
import { useGuildContext } from "../../context/GuildContext";

import { useGuild } from "../../hooks/useGuild";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";

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
  const { safe } = useSafeAppsSDK();
  const [displayPanel, setDisplayPanel] = useState(<GuildAppInstructions />);
  const { fetchGuildByAddress } = useGuild();
  const { guildMetadata } = useGuildContext();

  useEffect(() => {
    const fetchGuild = async () => {
      const resp = await fetchGuildByAddress(safe.safeAddress, safe.chainId);
      /* const guild = resp.length > 0 ? resp[0] : null; */
      const guild = guildMetadata.name ? true : false;
      if (guild) {
        setDisplayPanel(<GuildStats />);
      }
    };
    fetchGuild();
  }, [guildMetadata.name]);

  return (
    <Grid>
      <CreateGuildForm />
      <GridDisplay>{displayPanel}</GridDisplay>
    </Grid>
  );
};

export default GuildApp;
