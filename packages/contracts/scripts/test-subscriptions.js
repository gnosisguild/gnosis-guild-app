const CPK = require("contract-proxy-kit");
require("dotenv").config();
const fs = require('fs');
const { ethers, network } = require("hardhat");

const GuildAppABI = require("../artifacts/contracts/guild/GuildApp.sol/GuildApp.json").abi;
const ERC20Abi = require("../artifacts/@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol/IERC20Upgradeable.json").abi

const ADDRESSES_FILE = './addresses.json';

const AllowanceModuleAbi = [
    "function allowances(address safe, address delegate, address tokenAddress) public view returns (uint96 amount, uint96 spent, uint16 resetTimeMin, uint32 lastResetMin, uint16 nonce)",
    "function addDelegate(address delegate) public",
    "function getDelegates(address safe, uint48 start, uint8 pageSize) public view returns (address[] memory results, uint48 next)",
    "function generateTransferHash(address safe, address token, address to, uint96 amount, address paymentToken, uint96 payment, uint16 nonce) public view returns (bytes32)",
    "function setAllowance(address delegate, address token, uint96 allowanceAmount, uint16 resetTimeMin, uint32 resetBaseMin) public",
];

const getProxyBalance = async (signer, cpk, tokenAddress) => {

    if (tokenAddress === ethers.constants.AddressZero) {
      const balance = await signer.provider.getBalance(cpk.address);
      return balance.toString() === "NaN"
        ? ethers.BigNumber.from("0")
        : ethers.BigNumber.from(balance.toString());
    }

    const erc20 = new ethers.Contract(tokenAddress, ERC20Abi, signer);
    const balance = await erc20.balanceOf(cpk.address);
    return ethers.BigNumber.from(balance.toString());
  };

const setupCPK = async (signer, cpk, delegateContract, allowanceModuleAddr, tokenAddress, deposit) => {
    const isDeployed = await cpk.isProxyDeployed();

    if (isDeployed) {
      const safeVersion = await cpk.getContractVersion();
      const balance = await cpk.getBalance();
      const modules = await cpk.getModules();
      const owner = await cpk.getOwnerAccount();
      console.log(
        "CPK",
        cpk,
        cpk.address,
        safeVersion,
        owner,
        balance.toString(10),
        modules
      );
    }
    const hasAllowanceModule =
      isDeployed &&
      ((await cpk.getContractVersion()) !== "1.1.1"
        ? await cpk.isModuleEnabled(allowanceModuleAddr)
        : (await cpk.getModules()).includes(allowanceModuleAddr));
    console.log("STEP1: Check for AllowanceModule", hasAllowanceModule);

    // Delegate MUST be a GuildApp contract
    const delegate = delegateContract;

    const allowanceModule = new ethers.Contract(
        allowanceModuleAddr,
        AllowanceModuleAbi, // TODO
        signer
    );
    const delegates = await allowanceModule.getDelegates(cpk.address, 0, 10);
    const isDelegate = delegates.results.includes(delegate);
    console.log("STEP2: Check if guild is a delegate", isDelegate);

    // const currentDate = new Date();
    // const currentPeriod = new Date(
    //   currentDate.getFullYear(),
    //   currentDate.getMonth(),
    //   1
    // );
    // console.log("currentPeriod", currentPeriod);
    // // const blockNo = await ethersProvider.getBlockNumber();
    // // const block = await ethersProvider.getBlock(blockNo);

    console.log("PRE", allowanceModule.address, cpk.address, delegate, tokenAddress);

    const allowance = await allowanceModule.allowances(
      cpk.address,
      delegate,
      tokenAddress
    );
    console.log(
      "STEP3: Check allowance",
      // allowance,
      allowance.amount.toString()
    );
    const allowanceAmount = allowance.amount
      .add(ethers.BigNumber.from(deposit))
      .toString();
    console.log('New allowance', allowanceAmount);

    const txs = [
      !hasAllowanceModule && {
        operation: CPK.default.Call,
        to: cpk.address,
        value: 0,
        data: await cpk.contractManager.versionUtils.encodeEnableModule(
          allowanceModuleAddr
        ),
      },
      !isDelegate && {
        operation: CPK.default.Call,
        to: allowanceModuleAddr,
        value: 0,
        data: allowanceModule.interface.encodeFunctionData("addDelegate", [
          delegate,
        ]),
      },
      {
        operation: CPK.default.Call,
        to: allowanceModuleAddr,
        value: 0,
        data: allowanceModule.interface.encodeFunctionData("setAllowance", [
          delegate,
          tokenAddress,
          allowanceAmount,
          // SUBSCRIPTION_PERIOD_DEFAULT, // Get time in minutes
          2, // resetTimeMin - TODO: Subscription period in minutes
          // (currentPeriod.getTime() / 1000 / 60).toFixed(0), // TODO: First day of current Period. Get time in minutes
          0, // resetBaseMin
        ]),
      },
    ].filter((t) => t);
    console.log("Txs to be included", txs.length, txs);
    return txs
}

const subscribe = async (signer, guildApp, allowanceModuleAddr, tokenAddress, deposit) => {

    const ethLibAdapter = new CPK.EthersAdapter({ ethers, signer });
    const cpkInstance = await CPK.default.create({
        ethLibAdapter,
        ownerAccount: signer.address,
        isSafeApp: false,
    });

    console.log('Signer CPK', cpkInstance.address);

    const cpkBalance = await getProxyBalance(signer, cpkInstance, tokenAddress);
    console.log('cpkBalance', cpkBalance.toString());

    const minFunds = (5 * +deposit).toString(); // enough for 5 recurring subscriptions

    if (+cpkBalance.toString() <= +deposit) {
        console.log('Sending funds to proxy...');
        const rs = await signer.sendTransaction({
            to: cpkInstance.address,
            value: ethers.BigNumber.from(minFunds)
        });
        await rs.wait();
        const cpkBalanceAfter = await getProxyBalance(signer, cpkInstance, tokenAddress);
        console.log('cpkBalance after', cpkBalanceAfter.toString());
    }

    const setupTxs = await setupCPK(
        signer,
        cpkInstance,
        guildApp.address, // delegateContract,
        allowanceModuleAddr,
        tokenAddress,
        deposit,
    );

    const allowanceModule = new ethers.Contract(
        allowanceModuleAddr,
        AllowanceModuleAbi,
        signer
    );
    const allowance = await allowanceModule.allowances(
        cpkInstance.address,
        guildApp.address, // delegate,
        tokenAddress
    );

    const transferHash = await allowanceModule.generateTransferHash(
        cpkInstance.address,
        tokenAddress,
        guildApp.address,
        deposit,
        ethers.constants.AddressZero,
        0,
        allowance.nonce
    );
    console.log("transferHash", transferHash);

    const transferSignature = await signer.signMessage(transferHash);
    console.log('Signature', transferSignature);

    const args = [
        cpkInstance.address,
        "", // tokenURI,
        deposit,
        transferSignature,
    ];

    console.log('Exec CPK Tx...');
    const tx = await cpkInstance.execTransactions([
        ...setupTxs,
        {
          operation: CPK.default.Call,
          to: guildApp.address,
          value: "0",
          data: guildApp.interface.encodeFunctionData("subscribe", args),
        },
    ]);
    await tx.transactionResponse.wait();
}

const main = async () => {

    console.log("NET", network.name);

    // TODO: Only works on Rinkeby
    if (network.name === 'rinkeby') {
       
        const ALLOWANCE_MODULE = "0xCFbFaC74C26F8647cBDb8c5caf80BB5b32E43134";
        // Should run `scripts/generate-guilds.js` in order to create a guild
        const GUILD = "0x55f046c905DC4471C7E0E46214Beb19b73B24F4B";


        const json = fs.readFileSync(ADDRESSES_FILE);
        const addresses = JSON.parse(json.length > 0 ? json : "{}");
        if (addresses[network.name]) {
            [admin, skip1, skip2, alice, bob] = await ethers.getSigners();

            let aliceBalance = await alice.getBalance();
            let bobBalance = await bob.getBalance();

            if(+aliceBalance.toString() === 0) {
                console.log("Funding Alice...");
                const rs = await admin.sendTransaction({
                    to: alice.address,
                    value: ethers.BigNumber.from(1e17.toString())
                });
                await rs.wait();
            }

            if(+bobBalance.toString() === 0) {
                console.log("Funding Bob...");
                const rs = await admin.sendTransaction({
                    to: bob.address,
                    value: ethers.BigNumber.from(1e17.toString())
                });
                await rs.wait();
            }

            aliceBalance = await alice.getBalance();
            bobBalance = await bob.getBalance();

            console.log(
                "Wallets\n",
                `Admin: ${admin.address} -> ${(await admin.getBalance()).toString()}\n`,
                `Alice: ${alice.address} -> ${aliceBalance.toString()}\n`,
                `Bob: ${bob.address} -> ${bobBalance.toString()}\n`,
            );

            const guildApp = new ethers.Contract(GUILD, GuildAppABI, admin);

            const tokenAddress = await guildApp.tokenAddress();
            const deposit = await guildApp.subPrice();

            console.log('Guild', guildApp.address, tokenAddress, deposit.toString());

            // Alice
            await subscribe(alice, guildApp, ALLOWANCE_MODULE, tokenAddress, deposit.toString());
            // Bob
            await subscribe(bob, guildApp, ALLOWANCE_MODULE, tokenAddress, deposit.toString());

        } else {
            console.error(`Contract addresses not found for ${network.name} network`);
        }
        // console.error("This script is meant to be used for local development purposes");
    }
};

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });