import React from "react";
import { Button } from "@gnosis.pm/safe-react-components";
import styled from "styled-components";
import { useWeb3Context } from "../../context/Web3Context";

const ConnectButton = styled(Button)``;

// 55 min
const ConnectWeb3Button: React.FC = ({ children }) => {
  const { connectToWeb3, account, disconnect } = useWeb3Context();
  const onClickAction = account ? disconnect : connectToWeb3;
  return (
    <ConnectButton size="md" color="secondary" onClick={onClickAction}>
      {children}
    </ConnectButton>
  );
};

export default ConnectWeb3Button;
