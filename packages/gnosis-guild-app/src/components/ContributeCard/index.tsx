import React from "react";
import styled from "styled-components";
import { Text } from "@gnosis.pm/safe-react-components";

import { useGuildContext } from "../../context/GuildContext";

// Split out Contribute butoon and pass in as a child
const InfoCard = styled.div`
  background: lightgrey;
  width: 100%;
  max-width: 28rem;
  max-height: 4rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem 0.5rem 0rem 0rem;
  margin-top: 2rem;
`;
const ContributeCard: React.FC = ({ children }) => {
  const { guildMetadata } = useGuildContext();
  return (
    <>
      <InfoCard>
        <Text
          size="lg"
          strong
        >{`${guildMetadata.name} Contributors Receive`}</Text>
        <Text size="md">{guildMetadata.contentFormat}</Text>
      </InfoCard>
      {children}
    </>
  );
};

export default ContributeCard;
