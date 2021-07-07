import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import {
  Button,
  Card,
  CopyToClipboardBtn,
  Text,
  Title,
} from "@gnosis.pm/safe-react-components";
import { useGuildContext } from "../../context/GuildContext";
import { useWeb3Context } from "../../context/Web3Context";
import { API, APP_DOMAIN } from "../../constants";
import { fetchGuild } from "../../graphql";
import profile from "../../assets/profile.png";

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
  const [numContributors, setNumContributors] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("");
  const { guildMetadata } = useGuildContext();
  const hiddenAnchor = useRef<HTMLAnchorElement>(null);
  const fileUrl = "";
  const { account, ethersProvider, providerChainId } = useWeb3Context();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    const getTokens = async () => {
      const guild = await fetchGuild(
        guildMetadata.guildAddress,
        providerChainId
      );
      if (guild) {
        const guildMainBalance = guild.balances.find(
          (b) => b.tokenAddress === guild.tokenAddress
        );
        setNumTokens(
          ethers.utils.formatEther(
            guildMainBalance ? guildMainBalance.totalSubscriptions : "0"
          )
        );
        const x = await new Date(guild.lastMetadataUpdate * 1000).toUTCString();
        setNumContributors(guild.totalSubscribers);
        setLastUpdate(x);
      }
    };
    getTokens();
  }, [providerChainId, fetchGuild, guildMetadata.guildAddress]);

  const downloadContributors = async () => {
    const resp = await axios
      .get(
        `${API}/api/v1/contributorList?guildAddress=${guildMetadata.guildAddress}`
      )
      .catch((err) => {
        enqueueSnackbar("Failed to fetch CSV", {
          key: "failed-csv-notification-178",
          anchorOrigin: { horizontal: "right", vertical: "top" },
          preventDuplicate: true,
          variant: "error",
          onClick: () => {
            closeSnackbar("failed-csv-notification-178");
          },
        });
      });
    if (!resp) {
      return;
    }
    const data = new Blob([resp.data]);
    const url = URL.createObjectURL(data);
    const anchor = hiddenAnchor?.current;
    if (anchor) {
      anchor.href = url;
    }
    anchor?.click();
  };

  const imageUrl = guildMetadata.image
    ? URL.createObjectURL(guildMetadata.image)
    : "";
  console.log(imageUrl);

  return (
    <div style={{ width: "100%" }}>
      <ProfileImage src={imageUrl || profile} alt="Guild profile" />
      <Title size="md" strong>
        Guild Stats
      </Title>
      <StatItemContainer>
        <StatsText size="xl" strong>
          Other Internet Guild Page
        </StatsText>
        <CopyToClipboardBtn
          textToCopy={`${APP_DOMAIN}/#/guild/${guildMetadata.guildAddress}`}
        />
      </StatItemContainer>
      <Text size="lg">{`${APP_DOMAIN}/...`}</Text>
      <StatItemContainer>
        <StatsText size="xl" strong>
          Embed Code
        </StatsText>
        <CopyToClipboardBtn
          textToCopy={`<iframe src="${APP_DOMAIN}/#/guild/${guildMetadata.guildAddress}/contribute/link" />`}
        />
      </StatItemContainer>
      <Text size="lg">{`<iframe src="${APP_DOMAIN}/#/guild...`}</Text>
      <StatItemContainer>
        <Card style={{ width: "100%", maxWidth: "16rem" }}>
          <TitleCardContainer>
            <Text size="lg" color="primary" strong>
              {numContributors}
            </Text>
            <Text size="lg" strong>
              Contributors
            </Text>
          </TitleCardContainer>
          <CardContainer>
            <Text size="lg" color="primary" strong>
              {numTokens}
            </Text>
            <Text size="lg" strong>
              ETH
            </Text>
          </CardContainer>
        </Card>
      </StatItemContainer>
      <ButtonContainer>
        <Button
          size="lg"
          color="primary"
          variant="contained"
          onClick={downloadContributors}
        >
          Download Contributors List
        </Button>
        <a
          ref={hiddenAnchor}
          download="contributors.csv"
          type="text/csv"
          style={{ display: "none" }}
          href={fileUrl}
        >
          Download
        </a>
      </ButtonContainer>
      <Text size="sm">{`Last updated ${lastUpdate}`}</Text>
    </div>
  );
};

export default GuildStats;
