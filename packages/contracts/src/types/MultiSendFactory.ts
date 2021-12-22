/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { MultiSend } from "./MultiSend";

export class MultiSendFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<MultiSend> {
    return super.deploy(overrides || {}) as Promise<MultiSend>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MultiSend {
    return super.attach(address) as MultiSend;
  }
  connect(signer: Signer): MultiSendFactory {
    return super.connect(signer) as MultiSendFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MultiSend {
    return new Contract(address, _abi, signerOrProvider) as MultiSend;
  }
}

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "transactions",
        type: "bytes",
      },
    ],
    name: "multiSend",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];

const _bytecode =
  "0x60a060405234801561001057600080fd5b5030606081901b6080526102216100306000398060d652506102216000f3fe60806040526004361061001e5760003560e01c80638d80ff0a14610023575b600080fd5b6100c96004803603602081101561003957600080fd5b81019060208101813564010000000081111561005457600080fd5b82018360208201111561006657600080fd5b8035906020019184600183028401116401000000008311171561008857600080fd5b91908080601f0160208091040260200160405190810160405280939291908181526020018383808284376000920191909152509295506100cb945050505050565b005b306001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001614156101335760405162461bcd60e51b81526004018080602001828103825260308152602001806101bc6030913960400191505060405180910390fd5b805160205b818110156101b6578083015160f81c6001820184015160601c60158301850151603584018601516055850187016000856000811461017d576001811461018d57610198565b6000808585888a5af19150610198565b6000808585895af491505b50806101a357600080fd5b5050806055018501945050505050610138565b50505056fe4d756c746953656e642073686f756c64206f6e6c792062652063616c6c6564207669612064656c656761746563616c6ca26469706673582212203ad011a112da779ab79bf4cdcf15652ddc4734c9cc81a0e36544012d04801e1964736f6c63430007060033";