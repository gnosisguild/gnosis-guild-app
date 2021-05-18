import React, { useContext } from "react";
import Web3Modal from "web3modal";

export const Web3Context = React.createContext({});
export const useWeb3Context = () => useContext(Web3Context);

// Just follow the omnibridge example
// keep it simple for now
