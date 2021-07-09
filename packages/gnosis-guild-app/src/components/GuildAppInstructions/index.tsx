import React from "react";
import { Text, Title } from "@gnosis.pm/safe-react-components";

import GuildLogo from "../GuildLogo";

import styled from "styled-components";

const LogoContainer = styled.div`
  height: 10rem;
  max-width: 15rem;
  display: flex;
  justify-content: end;
  align-items: center;
`;

const GuildLogoStyled = styled(GuildLogo)`
  height: 8rem;
`;

const GuildAppInstructions: React.FC = () => (
  <div>
    <LogoContainer>
      <GuildLogoStyled />
    </LogoContainer>
    <Title size="md" strong>
      Guild App
    </Title>
    <Text size="lg">
      The Guild App is a permissionless crypto subscrioption tool.
    </Text>
    <br />
    <Text size="lg">
      As individuals or groups, creators can generate a unique website and embed
      code to collect monthly subscription payments in ETH or DAI sent directly
      to their Gnosis Safe Multisig. Creators also have access to their
      contributors wallet addresses for unique token drops.
    </Text>
    <br />
    <Text size="lg">
      Taking advantage of the unique Gnosis Safe Multisig features, creators can
      choose to pool subscription funds, earn interest in decentralized finance
      protocols in <strong>Safe Apps</strong>, and invest any returns in new
      endeavors.
    </Text>
    <br />
    <Text size="lg">
      Spawned from the lore of online guilds and new mutualism, Guild App is the
      begining of mutual funds for creators. Learn more about{" "}
      <strong>the vision behind Guild App and how it works</strong>.
    </Text>
    <br />
    <Text size="lg">Create your Guild in less than 60 seconds today.</Text>
  </div>
);

export default GuildAppInstructions;
