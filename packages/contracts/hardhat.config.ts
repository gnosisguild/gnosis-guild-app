import dotenv from "dotenv";
import { task, HardhatUserConfig } from "hardhat/config";
import { HDAccountsUserConfig } from "hardhat/types/config"
import "@nomiclabs/hardhat-etherscan";
import "@openzeppelin/hardhat-upgrades";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "hardhat-typechain";

dotenv.config();

task("accounts", "Prints the list of accounts", async (_, { ethers }) => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  // defaultNetwork: "rinkeby",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      // forking: {
      //   url: 'https://xdai-archive.blockscout.com',
      //   blockNumber: 14829086,
      //   enabled: false,
      // }
    },
    rinkeby: {
      chainId: 4,
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_ID}`,
      gas: 8e6,
      gasPrice: 10e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } as HDAccountsUserConfig : [process.env.ACCOUNT_PK!],
    },
    mumbai: {
      chainId: 80001,
      url: 'https://rpc-mumbai.maticvigil.com/',
      gas: 8e6,
      gasPrice: 1e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } as HDAccountsUserConfig : [process.env.ACCOUNT_PK!],
    },
    xdai: {
      chainId: 0x64,
      url: 'https://xdai.poanetwork.dev',
      gas: 8e6,
      gasPrice: 1e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } as HDAccountsUserConfig : [process.env.ACCOUNT_PK!],
    },
    matic: {
      chainId: 0x89,
      url: 'https://rpc-mainnet.maticvigil.com/',
      gas: 8e6,
      gasPrice: 1e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } as HDAccountsUserConfig : [process.env.ACCOUNT_PK!],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
  mocha: {
    timeout: 20000,
  },
  solidity: {
    compilers: [
      { version: '0.5.17' },
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        },
      },
    ],
  },
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
  },
};

export default config;

