const HDWalletProvider = require('@truffle/hdwallet-provider');
//const fs = require('fs');
//const mnemonic = fs.readFileSync(".secret").toString().trim();
const mnemonic = "1a1fd694570f84bcb670657d19b25e97bf441b9a638a89b69e11e125b1bbb48e";

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
    matic_mumbai: {
      provider: () => new HDWalletProvider(mnemonic, `https://matic-mumbai.chainstacklabs.com`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      disableConfirmationListener: true,
      gasPrice:10000000000, 
      gas: 10000000, 
    },
    goerli: {
       provider: () => new HDWalletProvider(mnemonic, `https://eth-goerli.g.alchemy.com/v2/yLafHt5uip0F_4CLSvkI6grjY1VvLIDu`),
       network_id: 5,       // Goerli's id
       chain_id: 5
     }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
        version: "0.8.13",
    }
  }
}