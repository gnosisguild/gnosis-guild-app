/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface IAllowanceModuleInterface extends ethers.utils.Interface {
  functions: {
    "executeAllowanceTransfer(address,address,address,uint96,address,uint96,address,bytes)": FunctionFragment;
    "generateTransferHash(address,address,address,uint96,address,uint96,uint16)": FunctionFragment;
    "getTokenAllowance(address,address,address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "executeAllowanceTransfer",
    values: [
      string,
      string,
      string,
      BigNumberish,
      string,
      BigNumberish,
      string,
      BytesLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "generateTransferHash",
    values: [
      string,
      string,
      string,
      BigNumberish,
      string,
      BigNumberish,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getTokenAllowance",
    values: [string, string, string]
  ): string;

  decodeFunctionResult(
    functionFragment: "executeAllowanceTransfer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "generateTransferHash",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTokenAllowance",
    data: BytesLike
  ): Result;

  events: {};
}

export class IAllowanceModule extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IAllowanceModuleInterface;

  functions: {
    executeAllowanceTransfer(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    "executeAllowanceTransfer(address,address,address,uint96,address,uint96,address,bytes)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<ContractTransaction>;

    generateTransferHash(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "generateTransferHash(address,address,address,uint96,address,uint96,uint16)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    getTokenAllowance(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<{
      0: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber];
    }>;

    "getTokenAllowance(address,address,address)"(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<{
      0: [BigNumber, BigNumber, BigNumber, BigNumber, BigNumber];
    }>;
  };

  executeAllowanceTransfer(
    safe: string,
    token: string,
    to: string,
    amount: BigNumberish,
    paymentToken: string,
    payment: BigNumberish,
    delegate: string,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  "executeAllowanceTransfer(address,address,address,uint96,address,uint96,address,bytes)"(
    safe: string,
    token: string,
    to: string,
    amount: BigNumberish,
    paymentToken: string,
    payment: BigNumberish,
    delegate: string,
    signature: BytesLike,
    overrides?: Overrides
  ): Promise<ContractTransaction>;

  generateTransferHash(
    safe: string,
    token: string,
    to: string,
    amount: BigNumberish,
    paymentToken: string,
    payment: BigNumberish,
    nonce: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  "generateTransferHash(address,address,address,uint96,address,uint96,uint16)"(
    safe: string,
    token: string,
    to: string,
    amount: BigNumberish,
    paymentToken: string,
    payment: BigNumberish,
    nonce: BigNumberish,
    overrides?: CallOverrides
  ): Promise<string>;

  getTokenAllowance(
    safe: string,
    delegate: string,
    token: string,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]>;

  "getTokenAllowance(address,address,address)"(
    safe: string,
    delegate: string,
    token: string,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]>;

  callStatic: {
    executeAllowanceTransfer(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "executeAllowanceTransfer(address,address,address,uint96,address,uint96,address,bytes)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    generateTransferHash(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    "generateTransferHash(address,address,address,uint96,address,uint96,uint16)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<string>;

    getTokenAllowance(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]>;

    "getTokenAllowance(address,address,address)"(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber, BigNumber, BigNumber, BigNumber]>;
  };

  filters: {};

  estimateGas: {
    executeAllowanceTransfer(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    "executeAllowanceTransfer(address,address,address,uint96,address,uint96,address,bytes)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<BigNumber>;

    generateTransferHash(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "generateTransferHash(address,address,address,uint96,address,uint96,uint16)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getTokenAllowance(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getTokenAllowance(address,address,address)"(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    executeAllowanceTransfer(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    "executeAllowanceTransfer(address,address,address,uint96,address,uint96,address,bytes)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      delegate: string,
      signature: BytesLike,
      overrides?: Overrides
    ): Promise<PopulatedTransaction>;

    generateTransferHash(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "generateTransferHash(address,address,address,uint96,address,uint96,uint16)"(
      safe: string,
      token: string,
      to: string,
      amount: BigNumberish,
      paymentToken: string,
      payment: BigNumberish,
      nonce: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getTokenAllowance(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getTokenAllowance(address,address,address)"(
      safe: string,
      delegate: string,
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
