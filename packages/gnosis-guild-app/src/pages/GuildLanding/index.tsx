import React from "react";
import styled from "styled-components";
import guildLogo from "../../assets/guildlogo.png";
import profile from "../../assets/profile.png";
import { useGuildContext } from "../../context/GuildContext";
import { useWeb3Context } from "../../context/Web3Context";
import ConnectWeb3Button from "../../components/ConnectWeb3Button";
import { Text, Title } from "@gnosis.pm/safe-react-components";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "logo profile wallet" 1fr
    / 1fr 2fr 1fr;
`;

const GridLogo = styled.div`
  grid-area: logo;
`;

const GridProfile = styled.div`
  grid-area: profile;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const GridWallet = styled.div`
  grid-area: wallet;
  display: flexl;
  justify-content: flex-end;
  margin-top: 1rem;
  margin-right: 1rem;
`;

const Logo = styled.img`
  height: 6rem;
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
  border-radius: 0.25rem 0.25rem 0rem 0rem;
  margin-top: 2rem;
`;

// TODO: Possibly add more pop to this button
const ContributeButton = styled.button`
  border-radius: 0rem 0rem 0.25rem 0.25rem;
  background: black;
  width: 100%;
  max-width: 28rem;
  max-height: 3rem;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
`;

// Need a div with a background
// Need some text fields
// Need a button that will redirect to the contribute page

const GuiildLanding: React.FC = () => {
  const { guildMetadata } = useGuildContext();
  const { account } = useWeb3Context();

  const connectButtonText = account
    ? `${account.substr(0, 5)}... Connected`
    : "Connect";

  return (
    <Grid>
      <GridLogo>
        <Logo src={guildLogo} alt="gnosis guild" />
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
        <InfoCard>
          <Text
            size="lg"
            strong={true}
          >{`${guildMetadata.name} Contributors Receive`}</Text>
          <Text size="md">{guildMetadata.contentFormat}</Text>
        </InfoCard>
        <ContributeButton>
          <Text size="lg" strong={true} color="white">
            Contibute
          </Text>
        </ContributeButton>
      </GridProfile>
      <GridWallet>
        <ConnectWeb3Button>{connectButtonText}</ConnectWeb3Button>
      </GridWallet>
    </Grid>
  );
};

export default GuiildLanding;
