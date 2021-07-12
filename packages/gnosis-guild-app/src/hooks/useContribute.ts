import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BigNumber, Contract, utils, providers } from "ethers";
import { useSnackbar } from "notistack";
import { useWeb3Context } from "../context/Web3Context";
import { useContributorContext } from "../context/ContributorContext";

import { useGuild } from "./useGuild";
import { useContributorProfile } from "./useContributorProfile";
import { useSubscriber } from "./useSubscriber";
import GuildAppABI from "../contracts/GuildApp.json";
import { fetchGuild } from "../graphql";

type Contribution = {
  submitContribution: (
    arg0: string,
    arg1: string,
    arg2: string,
    arg3: string
  ) => Promise<void>;
  contributionTx: () => Promise<void>;
  contributeText: string;
  contributeLoading: boolean;
  setContributeLoading: (arg0: boolean) => void;
  unsubscribe: (arg0: string) => Promise<providers.TransactionResponse>;
  modalFooter: string;
};

export const useContribute = (): Contribution => {
  const [contributeLoading, setContributeLoading] = useState(false);
  const [modalFooter, setModalFooter] = useState("");
  const { subscribed, setSubscribed, setSubscriber } = useSubscriber();
  const {
    account,
    providerChainId,
    ethersProvider,
    cpk,
    getProxyBalance,
    getBalanceOf,
  } = useWeb3Context();
  const { name, email, guildMinimumAmount } = useContributorContext();
  const { subscribe } = useGuild();
  const { guildId } = useParams<{ guildId: string }>();
  const { saveContributorProfile } = useContributorProfile();
  const { subscriber } = useSubscriber();
  const [guildMetadata, setGuildMetadata] = useState<any>();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const _fetchGuild = async () => {
      const meta = await fetchGuild(guildId, providerChainId || 4);
      if (meta) {
        setGuildMetadata(meta);
      }
    };
    _fetchGuild();
  }, [guildId, providerChainId]);

  const submitContribution = async (
    tokenAddress: string,
    contributorName: string,
    contributorEmail: string,
    guildMinimumAmount: string
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
        guildMinimumAmount
      );
      if (tx) {
        await tx.wait();
      }
    } catch (error) {
      enqueueSnackbar("Failed to contribute to guild", {
        anchorOrigin: { horizontal: "right", vertical: "top" },
        preventDuplicate: true,
        variant: "error",
      });
      return;
    }
    console.log("Saving Contributor");
    console.log(contributorName);
    console.log(contributorEmail);
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

  const submitContributionTx = async () => {
    setModalFooter(
      cpk
        ? "Creating Subscription using a Proxy..."
        : "Approving tokens & creating subscription..."
    );
    setContributeLoading(true);

    const bnValue = utils.parseEther(guildMinimumAmount);
    const proxyBalance = cpk?.address
      ? await getProxyBalance(guildMetadata.tokenAddress)
      : BigNumber.from("0");
    const balance = await getBalanceOf(account, guildMetadata.tokenAddress);

    if (balance.lt(bnValue) && cpk?.address && proxyBalance.lt(bnValue)) {
      enqueueSnackbar("Tx Failed. Not Enough Balance!", {
        anchorOrigin: { horizontal: "right", vertical: "top" },
        preventDuplicate: true,
        variant: "error",
      });

      console.error("Not Enough balance");
      setModalFooter("Tx Failed. Not Enough Balance!");
      return;
    }

    await submitContribution(
      guildMetadata.tokenAddress,
      name,
      email,
      guildMinimumAmount
    );
    setContributeLoading(false);
    setSubscribed(true);
    await setSubscriber();
  };

  const unsubscribeTx = async () => {
    setModalFooter("Cancelling Subscription...");
    setContributeLoading(true);
    const tx = await unsubscribe(guildMetadata.id);
    setContributeLoading(true);
    if (tx) {
      await tx.wait();
    }

    setContributeLoading(false);
    setSubscribed(false);
    await setSubscriber();
  };
  const loadingText = subscribed
    ? "Cancelling Contribution..."
    : "Sending Contribution...";
  const staticText = subscribed ? "Cancel Contribution" : "Contribute";
  const contributeText = !contributeLoading ? staticText : loadingText;
  const contributionTx = subscribed ? unsubscribeTx : submitContributionTx;

  return {
    submitContribution,
    contributionTx,
    contributeText,
    contributeLoading,
    setContributeLoading,
    unsubscribe,
    modalFooter,
  };
};
