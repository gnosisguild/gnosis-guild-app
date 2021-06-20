import React, { useEffect } from "react";
import { Button } from "@gnosis.pm/safe-react-components";
import { useWeb3Context } from "../../context/Web3Context";

type Props = {
  disconnectAction?: () => void;
};

const ConnectWeb3Button: React.FC<Props> = ({ children, disconnectAction }) => {
  const {
    connectToWeb3,
    account,
    disconnect,
    authenticateCeramic
  } = useWeb3Context();

  // set values to 0
  const web3Disconnect = () => {
    if (disconnectAction) {
      disconnectAction();
    }
    disconnect();
  };

  const onClickAction = account
    ? web3Disconnect
    : async () => {
        await connectToWeb3();
        await authenticateCeramic();
      };
  useEffect(() => {
    const ceramicAuth = async () => {
      await authenticateCeramic();
    };
    if (account) {
      ceramicAuth();
    }
  }, [account, authenticateCeramic]);
  return (
    <Button size="md" color="secondary" onClick={onClickAction}>
      {children}
    </Button>
  );
};

export default ConnectWeb3Button;
