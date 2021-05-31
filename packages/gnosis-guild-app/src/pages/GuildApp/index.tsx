import React, { useEffect, useState } from "react";
import styled from "styled-components";

import CreateGuildForm from "../../components/CreateGuildForm";
import GuildAppInstructions from "../../components/GuildAppInstructions";
import GuildStats from "../../components/GuildStats";

import { fetchGuildByAddress } from "../../lib/graphql";
import { useGuildContext } from "../../context/GuildContext";
import { Loader, Title } from "@gnosis.pm/safe-react-components";
import { SafeProvider, useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";

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
  // const { guildMetadata } = useGuildContext();
  const { safe } = useSafeAppsSDK();
  const [displayPanel, setDisplayPanel] = useState(<GuildAppInstructions />);

  useEffect(() => {
    const fetchGuild = async () => {
      console.log("Safe");
      console.log(safe);
      const resp = await fetchGuildByAddress(safe.safeAddress, safe.chainId);
      console.log(resp);
      const guild = resp.guilds ? resp.guilds[0] : null;
      if (guild) {
        setDisplayPanel(<GuildStats />);
      }
      console.log(resp);
    };
    fetchGuild();
  }, []);

  return (
    <Grid>
      <CreateGuildForm />
      <GridDisplay>{displayPanel}</GridDisplay>
    </Grid>
  );
};

export default GuildApp;
