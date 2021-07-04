import styled from "styled-components";

import React, { useEffect, useState } from "react";
import { Button, GenericModal, Icon } from "@gnosis.pm/safe-react-components";
import { useWeb3Context } from "../../context/Web3Context";
import { getIsValidChain } from "../../lib/networks";
import { useSnackbar } from "notistack";

type Props = {
  onDisconnect?: () => void;
};

const WarningContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const LargeIcon = styled(Icon)`
  align-self: center;
  svg {
    height: 64px;
    width: 64px;
  }
`;

const ConnectWeb3Button: React.FC<Props> = ({ children, onDisconnect }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isUnsupportedNetwork, setIsUnsupportedNetwork] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    connectToWeb3,
    account,
    disconnect,
    authenticateCeramic,
    connected,
    network,
  } = useWeb3Context();

  let warning;

  useEffect(() => {
    if (network) {
      setIsUnsupportedNetwork(getIsValidChain(network.chainId) ? false : true);
    }
  }, [network]);

  // Build unsupported network modal
  if (isUnsupportedNetwork) {
    const body = (
      <WarningContainer>
        <LargeIcon size="md" type="alert" color="rinkeby" />
        <p>
          Please select a currenyly supported network. The supported networks
          are xDai, Mainnet and Rinkeby
        </p>
      </WarningContainer>
    );
    warning = (
      <GenericModal
        onClose={() => {
          enqueueSnackbar("Please change to a supported network!", {
            anchorOrigin: { horizontal: "right", vertical: "top" },
            preventDuplicate: true,
            variant: "warning",
          });
        }}
        title={"Unsupported network selected"}
        body={body}
      />
    );
  }

  const web3disconnect = () => {
    if (onDisconnect) {
      onDisconnect();
    }
    disconnect();
  };

  const onClickAction = account
    ? web3disconnect
    : async () => {
        connectToWeb3();
      };

  useEffect(() => {
    const ceramicAuth = async () => {
      await authenticateCeramic();
    };
    let connectedIn = connected;
    if (account && currentAccount && account !== currentAccount) {
      setCurrentAccount("");
      connectedIn = false;
    }
    if (account && connectedIn && !isUnsupportedNetwork) {
      setCurrentAccount(account);
      ceramicAuth();
    }
  }, [account, connected, isUnsupportedNetwork]);
  return (
    <>
      <div>
        <Button size="md" color="secondary" onClick={onClickAction}>
          {children}
        </Button>
      </div>

      {warning}
    </>
  );
};

export default ConnectWeb3Button;
