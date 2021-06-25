import React, { useEffect, useState } from "react";
import { Button } from "@gnosis.pm/safe-react-components";
import { useWeb3Context } from "../../context/Web3Context";

type Props = {
  disconnectAction?: () => void;
};

const ConnectWeb3Button: React.FC<Props> = ({ children, disconnectAction }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const {
    connectToWeb3,
    account,
    disconnect,
    authenticateCeramic,
    connected
  } = useWeb3Context();

  // set values to 0
  const web3Disconnect = async () => {
    if (disconnectAction) {
      disconnectAction();
    }
    await disconnect();
  };

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
    console.log(connectedIn);
    if (account && connectedIn) {
      console.log(account);
      console.log(connected);
      console.log(window.ethereum);
      console.log("Authenticating Connect UseEffect");
      setCurrentAccount(account);
      ceramicAuth();
    }
  }, [account, connected]);
  return (
    <Button size="md" color="secondary" onClick={onClickAction}>
      {children}
    </Button>
  );
};

export default ConnectWeb3Button;
