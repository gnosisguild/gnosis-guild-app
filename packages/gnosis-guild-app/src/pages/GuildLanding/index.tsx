import React from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { Loader, Text, Title } from "@gnosis.pm/safe-react-components";

import profile from "../../assets/profile.png";
import { useWeb3Context } from "../../context/Web3Context";

import ConnectWeb3Button from "../../components/ConnectWeb3Button";
import ContributeButton from "../../components/ContributeButton";
import ContributeCard from "../../components/ContributeCard";
import GridAgreementFooter from "../../components/GridAgreementFooter";
import GridLogo from "../../components/GridLogo";
import GridWallet from "../../components/GridWallet";
import GuildLogo from "../../components/GuildLogo";
import RiskAgreement from "../../components/RiskAgreement";

import { useGuildByParams } from "../../hooks/useGuildByParams";
import { useRiskAgreement } from "../../hooks/useRiskAgreement";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "logo _ wallet" 1fr
    "logo profile wallet" 4fr
    "footer footer footer" var(--grid-permission-footer-height)
    / 1fr 2fr 1fr;
`;

const Loading = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const GridProfile = styled.div`
  grid-area: profile;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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
  const { getConnectText } = useWeb3Context();
  const connectText = getConnectText();
  const { loading, guild, guildActive } = useGuildByParams();
  const { guildId } = useParams<{ guildId: string }>();
  const { riskAgreement, setRiskAgreement } = useRiskAgreement();

  const disabledGuild = (
    <GridProfile>
      <Title size="sm" strong>
        {guild.name}
      </Title>
      <Text size="md" color="error">
        This creator has ended their subscription service.
      </Text>
      <Text size="md">
        If you&#39ve previously subscribed to this creator, connect your account
        to unsubscribe
      </Text>
    </GridProfile>
  );

  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      {guild.name ? (
        guild.active ? (
          <GridProfile>
            <Title size="sm" strong>
              {guild.name}
            </Title>
            <ProfileImage src={URL.createObjectURL(guild.image) || profile} />
            <TextWrapper>
              <Text size="md">{guild.description}</Text>
            </TextWrapper>
            <TextWrapper>
              <Text size="md">{guild.externalLink}</Text>
            </TextWrapper>
            <ContributeCard>
              {guild && guildActive && (
                <ContributeLink
                  to={{ pathname: `/guild/${guildId}/contribute` }}
                >
                  <ContributeButton>Contribute</ContributeButton>
                </ContributeLink>
              )}
            </ContributeCard>
          </GridProfile>
        ) : (
          disabledGuild
        )
      ) : (
        <Loading>
          {loading ? (
            <Loader size="md" />
          ) : (
            <Title size="sm" strong>
              404: Guild not found
            </Title>
          )}
        </Loading>
      )}
      <GridWallet>
        <ConnectWeb3Button>{connectText}</ConnectWeb3Button>
      </GridWallet>
      <GridAgreementFooter visible={!riskAgreement}>
        <RiskAgreement onClick={setRiskAgreement} />
      </GridAgreementFooter>
    </Grid>
  );
};

export default GuiildLanding;
