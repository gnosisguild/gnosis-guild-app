import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { Loader, Text, Title } from "@gnosis.pm/safe-react-components";

import profile from "../../assets/profile.png";
import { IPFS_GATEWAY } from "../../constants";
import { useWeb3Context } from "../../context/Web3Context";
import { useGuildContext, GuildMetadata } from "../../context/GuildContext";

import ConnectWeb3Button from "../../components/ConnectWeb3Button";
import ContributeButton from "../../components/ContributeButton";
import ContributeCard from "../../components/ContributeCard";
import GridAgreementFooter from "../../components/GridAgreementFooter";
import GridLogo from "../../components/GridLogo";
import GridWallet from "../../components/GridWallet";
import GuildLogo from "../../components/GuildLogo";
import RiskAgreement from "../../components/RiskAgreement";

import { fetchGuild } from "../../graphql";
import { useGuild } from "../../hooks/useGuild";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "logo profile wallet" 1fr
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
  const [guild, setGuild] = useState<GuildMetadata>({
    name: "",
    description: "",
    contentFormat: "",
    externalLink: "",
    image: new File([], ""),
    currency: "ETH",
    amount: "0",
    guildAddress: "",
    imageCid: ""
  });
  const [guildActive, setGuildActive] = useState(false);
  const { getConnectText, providerChainId } = useWeb3Context();
  const connectText = getConnectText();
  const { fetchMetadata } = useGuild();
  const [loading, setLoading] = useState(true);
  const { guildId } = useParams<{ guildId: string }>();
  const { setGuildMetadata } = useGuildContext();

  useEffect(() => {
    const _fetchGuild = async () => {
      const meta = await fetchGuild(guildId, providerChainId || 4); // TODO: fetch default Network
      if (meta) {
        setGuildActive(meta.active);
        let metadata = {
          ...guild
        };

        if (meta.metadataURI) {
          metadata = await fetchMetadata(meta.metadataURI, guildId);
        }
        let blob = new Blob();
        if (metadata.imageCid) {
          let resp = await fetch(
            `${IPFS_GATEWAY}/${metadata.imageCid}`
          ).catch((err: Error) =>
            console.error("Failed to fetch metadata image")
          );
          if (resp) {
            blob = await resp.blob();
          }
        }
        const data = {
          name: metadata.name,
          description: metadata.description,
          contentFormat: metadata.contentFormat,
          externalLink: metadata.externalLink,
          image: new File([blob], "profile.jpg"),
          currency: metadata.currency,
          amount: metadata.amount,
          guildAddress: metadata.guildAddress,
          imageCid: metadata.imageCid
        };
        setGuildMetadata(data);
        setGuild(data);
      }
      // TODO: Redirect to 404 if data is missing
      setLoading(false);
    };
    _fetchGuild();
  }, [guildId, providerChainId]);

  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      {guild.name ? (
        <GridProfile>
          <Title size="sm" strong={true}>
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
              <ContributeLink to={{ pathname: `/guild/${guildId}/contribute` }}>
                <ContributeButton>Contibute</ContributeButton>
              </ContributeLink>
            )}
          </ContributeCard>
        </GridProfile>
      ) : (
        <Loading>
          {loading ? (
            <Loader size="md" />
          ) : (
            <Title size="sm" strong={true}>
              404: Guild not found
            </Title>
          )}
        </Loading>
      )}
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
