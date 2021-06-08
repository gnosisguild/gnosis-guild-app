import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import profile from "../../assets/profile.png";
import {
  Button,
  Card,
  CopyToClipboardBtn,
  Text,
  Title
} from "@gnosis.pm/safe-react-components";
import { useGuildContext } from "../../context/GuildContext";
import { useWeb3Context } from "../../context/Web3Context";
import { useGuild } from "../../hooks/useGuild";

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
  const [numTokens, setNumTokens] = useState("0");
  const { guildMetadata, setGuildMetadata } = useGuildContext();
  const { account, ethersProvider, providerChainId } = useWeb3Context();
  const { fetchGuildTokens } = useGuild();

  useEffect(() => {
    const getTokens = async () => {
      const tokens = await fetchGuildTokens(
        providerChainId,
        ethersProvider,
        account,
        guildMetadata.currency
      );
      setNumTokens(ethers.utils.formatEther(tokens));
    };
    getTokens();
  }, [providerChainId, account, guildMetadata.currency]);

  return (
    <div style={{ width: "100%" }}>
      <ProfileImage
        src={URL.createObjectURL(guildMetadata.image)}
        alt="Guild profile"
      />
      <Title size="md" strong={true}>
        Guild Stats
      </Title>
      <StatItemContainer>
        <StatsText size="xl" strong={true}>
          Other Internet Guild Page
        </StatsText>
        <CopyToClipboardBtn
          textToCopy={`https://gateway.ipfs.io/ipfs/guild/${account}`}
        />
      </StatItemContainer>
      <Text size="lg">{"https://gateway.ipfs.io/ipfs..."}</Text>
      <StatItemContainer>
        <StatsText size="xl" strong={true}>
          Embed Code
        </StatsText>
        <CopyToClipboardBtn
          textToCopy={`<iframe src="https://ipfs.io/guild/${account}/contribute/link" />`}
        />
      </StatItemContainer>
      <Text size="lg">{`<iframe src="https://ipfs.io/guild...`}</Text>
      <StatItemContainer>
        <Card style={{ width: "100%", maxWidth: "16rem" }}>
          <TitleCardContainer>
            <Text size="lg" color="primary" strong={true}>
              0
            </Text>
            <Text size="lg" strong={true}>
              Contributors
            </Text>
          </TitleCardContainer>
          <CardContainer>
            <Text size="lg" color="primary" strong={true}>
              {numTokens}
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
