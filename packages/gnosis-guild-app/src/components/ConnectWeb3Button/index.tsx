import React, { useEffect } from "react";
import { Button } from "@gnosis.pm/safe-react-components";
import { useWeb3Context } from "../../context/Web3Context";

// 55 min
const ConnectWeb3Button: React.FC = ({ children }) => {
  const {
    connectToWeb3,
    account,
    disconnect,
    authenticateCeramic
  } = useWeb3Context();
  const onClickAction = account
    ? disconnect
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
  }, [account]);
  return (
    <Button size="md" color="secondary" onClick={onClickAction}>
      {children}
    </Button>
  );
};

export default ConnectWeb3Button;
