import React, { Fragment } from "react";
import { Text, Title } from "@gnosis.pm/safe-react-components";

import styled from "styled-components";
const LogoContainer = styled.div`
  background: lightseagreen;
  height: 7rem;
  max-width: 15rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
`;

const GuildAppInstructions: React.FC = () => {
  return (
    <DescriptionContainer>
      <LogoContainer>Guild Gnosis Logo TBC</LogoContainer>
      <Title size="md" strong={true}>
        Guild App
      </Title>
      <Text size="lg">
        The Guild App is a permissionless crypto subscrioption tool.
      </Text>
      <br />
      <Text size="lg">
        As individuals or groups, creators can generate a unique website and
        embed code to collect monthly subscription payments in ETH or DAI sent
        directly to their Gnosis Safe Multisig. Creators also have access to
        their contributors wallet addresses for unique token drops.
      </Text>
      <br />
      <Text size="lg">
        Taking advantage of the unique Gnosis Safe Multisig features, creators
        can choose to pool subscription funds, earn interest in decentralized
        finance protocols in <strong>Safe Apps</strong>, and invest any returns
        in new endeavors.
      </Text>
      <br />
      <Text size="lg">
        Spawned from the lore of online guilds and new mutualism, Guild App is
        the begining of mutual funds for creators. Learn more about{" "}
        <strong>the vision behind Guild App and how it works</strong>.
      </Text>
      <br />
      <Text size="lg">Create your Guild in less than 60 seconds today.</Text>
    </DescriptionContainer>
  );
};

export default GuildAppInstructions;
