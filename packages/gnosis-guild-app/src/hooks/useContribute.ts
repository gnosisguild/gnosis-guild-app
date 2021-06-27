import { useState } from "react";
import { useParams } from "react-router-dom";
import { useWeb3Context } from "../context/Web3Context";

import { useGuild } from "../hooks/useGuild";
import { useContributorProfile } from "../hooks/useContributorProfile";

export const useContribute = () => {
  const [contributeLoading, setContributeLoading] = useState(false);
  const { providerChainId, ethersProvider } = useWeb3Context();
  const { subscribe } = useGuild();
  const { guildId } = useParams<{ guildId: string }>();
  const { saveContributorProfile } = useContributorProfile();

  const submitContribution = async (
    tokenAddress: string,
    guildMinimumAmount: string,
    contributorName: string,
    contributorEmail: string
  ): Promise<void> => {
    if (!ethersProvider) {
      console.error("EthersProvider has not been set yet");
      return;
    }

    setContributeLoading(true);
    try {
      await subscribe(
        providerChainId,
        ethersProvider,
        guildId,
        tokenAddress,
        guildMinimumAmount,
        {
          name: contributorName,
          email: contributorEmail
        }
      );
    } catch (error) {
      // TODO: Show an pop-up error
    }
    await saveContributorProfile(contributorName, contributorEmail);
    setContributeLoading(false);
  };

  return {
    submitContribution,
    contributeLoading,
    setContributeLoading
  };
};
