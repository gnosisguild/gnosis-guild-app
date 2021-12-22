/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { GuardManager } from "./GuardManager";

export class GuardManagerFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<GuardManager> {
    return super.deploy(overrides || {}) as Promise<GuardManager>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): GuardManager {
    return super.attach(address) as GuardManager;
  }
  connect(signer: Signer): GuardManagerFactory {
    return super.connect(signer) as GuardManagerFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GuardManager {
    return new Contract(address, _abi, signerOrProvider) as GuardManager;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "guard",
        type: "address",
      },
    ],
    name: "ChangedGuard",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "guard",
        type: "address",
      },
    ],
    name: "setGuard",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061012f806100206000396000f3fe6080604052348015600f57600080fd5b506004361060285760003560e01c8063e19a9dd914602d575b600080fd5b605060048036036020811015604157600080fd5b50356001600160a01b03166052565b005b605860bc565b7f4a204f620c8c5ccdca3fd54d003badd85ba500436a431f0cbda4f558c93c34c8818155604080516001600160a01b038416815290517f1151116914515bc0891ff9047a6cb32cf902546f83066499bcf8ba33d2353fa29181900360200190a15050565b33301460f7576040805162461bcd60e51b8152602060048201526005602482015264475330333160d81b604482015290519081900360640190fd5b56fea26469706673582212208ef9138f570398c589ea5140336f51c69609c5308d548c340c95fae3c6714d3864736f6c63430007060033";
