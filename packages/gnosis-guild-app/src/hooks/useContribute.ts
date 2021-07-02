import { useState } from "react";
import { useParams } from "react-router-dom";
import { Contract, ethers } from "ethers";
import { useWeb3Context } from "../context/Web3Context";

import { useGuild } from "../hooks/useGuild";
import { useContributorProfile } from "../hooks/useContributorProfile";
import { useSubscriber } from "../hooks/useSubscriber";
import GuildAppABI from "../contracts/GuildApp.json";

export const useContribute = () => {
  const [contributeLoading, setContributeLoading] = useState(false);
  const { providerChainId, ethersProvider } = useWeb3Context();
  const { subscribe } = useGuild();
  const { guildId } = useParams<{ guildId: string }>();
  const { saveContributorProfile } = useContributorProfile();
  const { subscriber } = useSubscriber();

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
      const tx = await subscribe(
        providerChainId,
        ethersProvider,
        guildId,
        tokenAddress,
        guildMinimumAmount,
        {
          name: contributorName,
          email: contributorEmail,
        }
      );
      if (tx) {
        await tx.wait();
      }
    } catch (error) {
      // TODO: Show an pop-up error
    }
    await saveContributorProfile(contributorName, contributorEmail);
    setContributeLoading(false);
  };

  const unsubscribe = async (guildAddress: string) => {
    if (!ethersProvider) {
      return;
    }
    const guildContract = new Contract(
      guildAddress,
      GuildAppABI,
      ethersProvider.getSigner()
    );
    const tx = await guildContract
      .unsubscribe(subscriber.keyId)
      .catch((err: Error) => console.error(err));
    return tx;
  };

  return {
    submitContribution,
    contributeLoading,
    setContributeLoading,
    unsubscribe,
  };
};
