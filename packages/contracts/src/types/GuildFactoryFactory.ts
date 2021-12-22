/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { GuildFactory } from "./GuildFactory";

export class GuildFactoryFactory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(overrides?: Overrides): Promise<GuildFactory> {
    return super.deploy(overrides || {}) as Promise<GuildFactory>;
  }
  getDeployTransaction(overrides?: Overrides): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): GuildFactory {
    return super.attach(address) as GuildFactory;
  }
  connect(signer: Signer): GuildFactoryFactory {
    return super.connect(signer) as GuildFactoryFactory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): GuildFactory {
    return new Contract(address, _abi, signerOrProvider) as GuildFactory;
  }
}

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "guildOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "guild",
        type: "address",
      },
    ],
    name: "NewGuild",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_initData",
        type: "bytes",
      },
    ],
    name: "createGuild",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "_initData",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "createGuild",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "guildsOf",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_template",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_salt",
        type: "bytes32",
      },
    ],
    name: "predictDeterministicAddress",
    outputs: [
      {
        internalType: "address",
        name: "predicted",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "template",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalGuilds",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610dfb806100206000396000f3fe608060405234801561001057600080fd5b506004361061007d5760003560e01c80635fee5cfd1161005b5780635fee5cfd146100d35780636f2ddd93146100e8578063afd58143146100f0578063c4d66de8146101105761007d565b80631d2fccc61461008257806339b04852146100975780635414dff0146100aa575b600080fd5b610095610090366004610bd1565b610123565b005b6100956100a5366004610c11565b610168565b6100bd6100b8366004610bb9565b6101a6565b6040516100ca9190610c5b565b60405180910390f35b6100db6101cb565b6040516100ca9190610d46565b6100bd6101dc565b6101036100fe366004610b72565b6101f1565b6040516100ca9190610c6f565b61009561011e366004610b72565b6102d9565b6000546201000090046001600160a01b031661015a5760405162461bcd60e51b815260040161015190610cbc565b60405180910390fd5b61016482826102e5565b5050565b6000546201000090046001600160a01b03166101965760405162461bcd60e51b815260040161015190610cbc565b6101a183838361030e565b505050565b600080546101c3906201000090046001600160a01b03168361033e565b90505b919050565b60006101d76001610354565b905090565b6000546201000090046001600160a01b031681565b6001600160a01b03811660009081526002602052604081206060919061021690610358565b67ffffffffffffffff8111801561022c57600080fd5b50604051908082528060200260200182016040528015610256578160200160208202803683370190505b50905060005b6001600160a01b038416600090815260026020526040902061027d90610358565b8110156102d2576001600160a01b03841660009081526002602052604090206102a69082610363565b8282815181106102b257fe5b6001600160a01b039092166020928302919091019091015260010161025c565b5092915050565b6102e28161036f565b50565b60005433906101a190610306906201000090046001600160a01b031661041a565b8285856104b7565b600054339061033890610330906201000090046001600160a01b03168461060f565b8286866104b7565b50505050565b600061034b8383306106b4565b90505b92915050565b5490565b60006101c382610354565b600061034b8383610712565b600054610100900460ff16806103885750610388610776565b80610396575060005460ff16155b6103d15760405162461bcd60e51b815260040180806020018281038252602e815260200180610d98602e913960400191505060405180910390fd5b600054610100900460ff161580156103fc576000805460ff1961ff0019909116610100171660011790555b61040582610787565b8015610164576000805461ff00191690555050565b6000604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b81528260601b60148201526e5af43d82803e903d91602b57fd5bf360881b60288201526037816000f09150506001600160a01b0381166101c6576040805162461bcd60e51b8152602060048201526016602482015275115490cc4c4d8dce8818dc99585d194819985a5b195960521b604482015290519081900360640190fd5b6104c1600161084b565b836001600160a01b0316836001600160a01b03167f2421772b9a2bfe82afb99bffc50912fd043b36c18b6b33dea404672d33d7e91d60405160405180910390a380156105535761055182828080601f016020809104026020016040519081016040528093929190818152602001838380828437600092019190915250506001600160a01b03881692915050610854565b505b6000849050806001600160a01b031663158ef93e6040518163ffffffff1660e01b815260040160206040518083038186803b15801561059157600080fd5b505afa1580156105a5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906105c99190610b99565b6105e55760405162461bcd60e51b815260040161015190610d00565b6001600160a01b03841660009081526002602052604090206106079086610896565b505050505050565b6000604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b81528360601b60148201526e5af43d82803e903d91602b57fd5bf360881b6028820152826037826000f59150506001600160a01b03811661034e576040805162461bcd60e51b815260206004820152601760248201527f455243313136373a2063726561746532206661696c6564000000000000000000604482015290519081900360640190fd5b604051733d602d80600a3d3981f3363d3d373d3d3d363d7360601b8152606093841b60148201526f5af43d82803e903d91602b57fd5bf3ff60801b6028820152921b6038830152604c8201526037808220606c830152605591012090565b815460009082106107545760405162461bcd60e51b8152600401808060200182810382526022815260200180610d506022913960400191505060405180910390fd5b82600001828154811061076357fe5b9060005260206000200154905092915050565b6000610781306108ab565b15905090565b600054610100900460ff16806107a057506107a0610776565b806107ae575060005460ff16155b6107e95760405162461bcd60e51b815260040180806020018281038252602e815260200180610d98602e913960400191505060405180910390fd5b600054610100900460ff16158015610814576000805460ff1961ff0019909116610100171660011790555b6000805462010000600160b01b031916620100006001600160a01b038516021790558015610164576000805461ff00191690555050565b80546001019055565b606061034b83836040518060400160405280601e81526020017f416464726573733a206c6f772d6c6576656c2063616c6c206661696c656400008152506108b1565b600061034b836001600160a01b0384166108ca565b3b151590565b60606108c08484600085610914565b90505b9392505050565b60006108d68383610a6f565b61090c5750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561034e565b50600061034e565b6060824710156109555760405162461bcd60e51b8152600401808060200182810382526026815260200180610d726026913960400191505060405180910390fd5b61095e856108ab565b6109af576040805162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e7472616374000000604482015290519081900360640190fd5b600080866001600160a01b031685876040518082805190602001908083835b602083106109ed5780518252601f1990920191602091820191016109ce565b6001836020036101000a03801982511681845116808217855250505050505090500191505060006040518083038185875af1925050503d8060008114610a4f576040519150601f19603f3d011682016040523d82523d6000602084013e610a54565b606091505b5091509150610a64828286610a87565b979650505050505050565b60009081526001919091016020526040902054151590565b60608315610a965750816108c3565b825115610aa65782518084602001fd5b8160405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b83811015610af0578181015183820152602001610ad8565b50505050905090810190601f168015610b1d5780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b60008083601f840112610b3c578182fd5b50813567ffffffffffffffff811115610b53578182fd5b602083019150836020828501011115610b6b57600080fd5b9250929050565b600060208284031215610b83578081fd5b81356001600160a01b03811681146108c3578182fd5b600060208284031215610baa578081fd5b815180151581146108c3578182fd5b600060208284031215610bca578081fd5b5035919050565b60008060208385031215610be3578081fd5b823567ffffffffffffffff811115610bf9578182fd5b610c0585828601610b2b565b90969095509350505050565b600080600060408486031215610c25578081fd5b833567ffffffffffffffff811115610c3b578182fd5b610c4786828701610b2b565b909790965060209590950135949350505050565b6001600160a01b0391909116815260200190565b6020808252825182820181905260009190848201906040850190845b81811015610cb05783516001600160a01b031683529284019291840191600101610c8b565b50909695505050505050565b60208082526024908201527f4775696c64466163746f72793a204d697373696e67204775696c642054656d706040820152636c61746560e01b606082015260800190565b60208082526026908201527f4775696c64466163746f72793a204775696c64417070206e6f7420696e697469604082015265185b1a5e995960d21b606082015260800190565b9081526020019056fe456e756d657261626c655365743a20696e646578206f7574206f6620626f756e6473416464726573733a20696e73756666696369656e742062616c616e636520666f722063616c6c496e697469616c697a61626c653a20636f6e747261637420697320616c726561647920696e697469616c697a6564a2646970667358221220ad3d68ba3b878de2ad38e8e1f59142fff8a899df8833135c3d337b9c852fab9b64736f6c63430007060033";
