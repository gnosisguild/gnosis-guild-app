require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
require("@openzeppelin/hardhat-upgrades");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
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
      } : [process.env.ACCOUNT_PK],
    },
    mumbai: {
      chainId: 80001,
      url: 'https://rpc-mumbai.maticvigil.com/',
      gas: 8e6,
      gasPrice: 1e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } : [process.env.ACCOUNT_PK],
    },
    xdai: {
      chainId: 0x64,
      url: 'https://xdai.poanetwork.dev',
      gas: 8e6,
      gasPrice: 1e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } : [process.env.ACCOUNT_PK],
    },
    matic: {
      chainId: 0x89,
      url: 'https://rpc-mainnet.maticvigil.com/',
      gas: 8e6,
      gasPrice: 1e9,
      accounts: process.env.MNEMONIC ? {
        mnemonic: process.env.MNEMONIC,
      } : [process.env.ACCOUNT_PK],
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
};

