require('dotenv').config()
const HDWalletProvider = require('@truffle/hdwallet-provider')
const path = require('path')

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */
  contracts_build_directory: path.join(__dirname, 'client/src/contracts'),
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 7545, // Standard Ethereum port (default: none)
      network_id: 1337, // Any network (default: none)
    },
    matic: {
      provider: () =>
        new HDWalletProvider(
          process.env.MNEMONIC,
          "https://matic-mumbai.chainstacklabs.com"
          // "wss://matic-testnet-archive-ws.bwarelabs.com"
          // "wss://speedy-nodes-nyc.moralis.io/b48811af94e55510db5ac92f/polygon/mumbai/ws"
          // "https://rpc-mumbai.maticvigil.com"
          // "https://rpc-mumbai.maticvigil.com/v1/f2387a4807471c5ee85d53e6e1ce04086d27b35c"
          // "wss://ws-matic-mumbai.chainstacklabs.com"
        ),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(process.env.MNEMONIC, process.env.INFURA),
      network_id: 42,
      gasPrice: 45000000000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      networkCheckTimeout: 1000000,
    },
  },
  compilers: {
    solc: {
      version: '0.8.7', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {
        // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200,
        },
        evmVersion: 'byzantium',
      },
    },
  },
  // plugins: [
  //   'truffle-contract-size'
  // ]

  // Truffle DB is currently disabled by default; to enable it, change enabled:
  // false to enabled: true. The default storage location can also be
  // overridden by specifying the adapter settings, as shown in the commented code below.
  //
  // NOTE: It is not possible to migrate your contracts to truffle DB and you should
  // make a backup of your artifacts to a safe location before enabling this feature.
  //
  // After you backed up your artifacts you can utilize db by running migrate as follows:
  // $ truffle migrate --reset --compile-all
  //
  // db: {
  // enabled: false,
  // host: "127.0.0.1",
  // adapter: {
  //   name: "sqlite",
  //   settings: {
  //     directory: ".db"
  //   }
  // }
  // }
}
