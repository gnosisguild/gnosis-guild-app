/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer } from "ethers";
import { Provider } from "@ethersproject/providers";

import type { Erc165Upgradeable } from "./Erc165Upgradeable";

export class Erc165UpgradeableFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Erc165Upgradeable {
    return new Contract(address, _abi, signerOrProvider) as Erc165Upgradeable;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
