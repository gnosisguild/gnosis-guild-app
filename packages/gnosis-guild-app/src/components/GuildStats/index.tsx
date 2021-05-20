import React from "react";
import styled from "styled-components";
import profile from "../../assets/profile.png";
import {
  Button,
  Card,
  CopyToClipboardBtn,
  Text,
  Title,
} from "@gnosis.pm/safe-react-components";
import { useGuildContext } from "../../context/GuildContext";

const ProfileImage = styled.img`
  height: 6rem;
  object-fit: contain;
`;

const StatItemContainer = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const TitleCardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  margin-bottom: 1rem;
  margin-right: 0.4rem;
`;

const StatsText = styled(Text)`
  margin-right: 0.5rem;
`;

const GuildStats: React.FC = () => {
  const { guildMetadata } = useGuildContext();

  return (
    <div style={{ width: "100%" }}>
      <ProfileImage src={profile} alt="Guild profile" />
      <Title size="md" strong={true}>
        Guild Stats
      </Title>
      <StatItemContainer>
        <StatsText size="xl" strong={true}>
          Other Internet Guild Page
        </StatsText>
        <CopyToClipboardBtn textToCopy={guildMetadata.externalLink} />
      </StatItemContainer>
      <Text size="lg">{guildMetadata.externalLink}</Text>
      <StatItemContainer>
        <StatsText size="xl" strong={true}>
          Embed Code
        </StatsText>
        <CopyToClipboardBtn
          textToCopy={'<ifram="https://ipfs.io/ipfs/Al..."'}
        />
      </StatItemContainer>
      <Text size="lg">{'<ifram="https://ipfs.io/ipfs/Al..."'}</Text>
      <StatItemContainer>
        <Card style={{ width: "100%", maxWidth: "16rem" }}>
          <TitleCardContainer>
            <Text size="lg" color="primary" strong={true}>
              246
            </Text>
            <Text size="lg" strong={true}>
              Contributors
            </Text>
          </TitleCardContainer>
          <CardContainer>
            <Text size="lg" color="primary" strong={true}>
              8.023
            </Text>
            <Text size="lg" strong={true}>
              ETH
            </Text>
          </CardContainer>
        </Card>
      </StatItemContainer>
      <ButtonContainer>
        <Button size="lg" color="primary" variant="contained">
          Download Contributors List
        </Button>
      </ButtonContainer>
      <Text size="sm">Last updated 11 November at 10:46 UTC</Text>
    </div>
  );
};

export default GuildStats;
