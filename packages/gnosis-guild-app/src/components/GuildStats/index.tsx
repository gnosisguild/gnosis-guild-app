import React, { useState } from "react";
import styled from "styled-components";
import profile from "../../assets/profile.png";
import {
  Button,
  Card,
  Icon,
  Text,
  Title,
} from "@gnosis.pm/safe-react-components";
import { useGuildContext } from "../../context/GuildContext";

const ProfileImage = styled.img`
  height: 100px;
  object-fit: contain;
`;

const CopyTitleContainer = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const IconContainer = styled.div`
  margin-left: 0.3rem;
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

// Image, Probably next to the logo
// title
// header
// header
// Card
// Button
// sub text
const GuildStats: React.FC = () => {
  const { guildMetadata } = useGuildContext();
  const [copyTooltip, setCopyTooltip] = useState("Copy to clipboard");
  const onClickCopy = () => {
    // Clipboard copy needs permissions to write to the clipboard
    // navigator.clipboard.writeText(guildMetadata.externalLink);
    setCopyTooltip("Copied");
  };
  const onBlurCopy = () => {
    setCopyTooltip("Copy to clipboard");
  };
  return (
    <div style={{ width: "100%" }}>
      <ProfileImage src={profile} alt="Guild profile" />
      <Title size="md" strong={true}>
        Guild Stats
      </Title>
      <CopyTitleContainer>
        <Text size="xl" strong={true}>
          Other Internet Guild Page
        </Text>
        <IconContainer onMouseOut={onBlurCopy} onClick={onClickCopy}>
          <Icon size="sm" type="copy" tooltip={copyTooltip} />
        </IconContainer>
      </CopyTitleContainer>
      <Text size="lg">{guildMetadata.externalLink}</Text>
      <CopyTitleContainer>
        <Text size="xl" strong={true}>
          Embed Code
        </Text>
        <IconContainer onBlur={onBlurCopy} onClick={onClickCopy}>
          <Icon size="sm" type="copy" tooltip={copyTooltip} />
        </IconContainer>
      </CopyTitleContainer>
      <Text size="lg">{'<ifram="https://ipfs"'}</Text>
      <CopyTitleContainer>
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
      </CopyTitleContainer>
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
