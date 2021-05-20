import React from "react";
import styled from "styled-components";

const Wallet = styled.div`
  grid-area: wallet;
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
  margin-right: 1rem;
`;

const GridWallet: React.FC = ({ children }) => {
  return <Wallet>{children}</Wallet>;
};

export default GridWallet;
