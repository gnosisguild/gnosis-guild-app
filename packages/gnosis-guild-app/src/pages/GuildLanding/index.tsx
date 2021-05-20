import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import profile from "../../assets/profile.png";
import { useGuildContext } from "../../context/GuildContext";
import { useWeb3Context } from "../../context/Web3Context";

import ConnectWeb3Button from "../../components/ConnectWeb3Button";
import ContributeButton from "../../components/ContributeButton";
import ContributeCard from "../../components/ContributeCard";
import GridAgreementFooter from "../../components/GridAgreementFooter";
import GridLogo from "../../components/GridLogo";
import GridWallet from "../../components/GridWallet";
import GuildLogo from "../../components/GuildLogo";
import RiskAgreement from "../../components/RiskAgreement";

import { Button, Text, Title } from "@gnosis.pm/safe-react-components";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "logo profile wallet" 1fr
    "footer footer footer" var(--grid-permission-footer-height)
    / 1fr 2fr 1fr;
`;

const GridProfile = styled.div`
  grid-area: profile;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const ProfileImage = styled.img`
  height: 12rem;
  object-fit: contain;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
  max-width: 27rem;
`;

const ContributeLink = styled(Link)`
  width: 100%;
  max-width: 28rem;
  max-height: 3rem;
  height: 100%;
  text-decoration: none;
`;

const GuiildLanding: React.FC = () => {
  const { guildMetadata } = useGuildContext();
  const { getConnectText } = useWeb3Context();
  const connectText = getConnectText();

  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      <GridProfile>
        <Title size="sm" strong={true}>
          {guildMetadata.name}
        </Title>
        <ProfileImage src={profile} />
        <TextWrapper>
          <Text size="md">{guildMetadata.description}</Text>
        </TextWrapper>
        <TextWrapper>
          <Text size="md">{guildMetadata.externalLink}</Text>
        </TextWrapper>
        <ContributeCard>
          <ContributeLink to={{ pathname: "/guild/1/contribute" }}>
            <ContributeButton>Contibute</ContributeButton>
          </ContributeLink>
        </ContributeCard>
      </GridProfile>
      <GridWallet>
        <ConnectWeb3Button>{connectText}</ConnectWeb3Button>
      </GridWallet>
      <GridAgreementFooter>
        <RiskAgreement />
      </GridAgreementFooter>
    </Grid>
  );
};

export default GuiildLanding;
