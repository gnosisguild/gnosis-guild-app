import styled from "styled-components";

import React, { useEffect, useState } from "react";
import { Button, GenericModal, Icon } from "@gnosis.pm/safe-react-components";
import { useWeb3Context } from "../../context/Web3Context";
import { networks } from "../../lib/networks";
import { useSnackbar } from "notistack";

type Props = {
  disconnectAction?: () => void;
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

const ConnectWeb3Button: React.FC<Props> = ({ children, disconnectAction }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isUnsupportedNetwork, setIsUnsupportedNetwork] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    connectToWeb3,
    account,
    disconnect,
    authenticateCeramic,
    connected,
    network
  } = useWeb3Context();

  // set values to 0
  const web3Disconnect = async () => {
    if (disconnectAction) {
      disconnectAction();
    }
    await disconnect();
  };

  let warning;

  useEffect(() => {
    if (network) {
      setIsUnsupportedNetwork(networks[network.chainId] ? false : true);
    }
  }, [network]);

  if (isUnsupportedNetwork) {
    // OnClose switch to a supported network
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
            variant: "warning"
          });
        }}
        title={"Unsupported network selected"}
        body={body}
      />
    );
  }

  const onClickAction = account
    ? web3Disconnect
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
      web3Disconnect();
    }
    if (account && connectedIn && !isUnsupportedNetwork) {
      setCurrentAccount(account);
      ceramicAuth();
    }
  }, [account, connected, isUnsupportedNetwork]);
  return (
    <>
      <Button size="md" color="secondary" onClick={onClickAction}>
        {children}
      </Button>
      {warning}
    </>
  );
};

export default ConnectWeb3Button;
