require('dotenv').config();
const HDWalletProvider = require("@truffle/hdwallet-provider");
const pk = "1a1fd694570f84bcb670657d19b25e97bf441b9a638a89b69e11e125b1bbb48e";


//use(Web3ClientPlugin)

//const getPOSClient = (network = 'testnet', version = 'mumbai') => {
//  const posClient = new POSClient()
//  return  posClient.init({
//    log: true,
//    network: network,
//    version: version,
//    child: {
//      provider: new HDWalletProvider(pk, `https://polygon-mumbai.infura.io/v3/`),
//      defaultConfig: {
//        from : "0xb954de63aAc9dc7D03f82046c4505EA27c16b5e1"
//      }
//    },
//    parent: {
//      provider: new HDWalletProvider(pk, `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`),
//      defaultConfig: {
//        from : "0xb954de63aAc9dc7D03f82046c4505EA27c16b5e1"
//      }
//    },
//  })
//}

//const posClient = new POSClient();
//posClient.init({
//    network: 'testnet',
//    version: 'mumbai',
//    child: {
//      provider: new HDWalletProvider(pk, `https://polygon-mumbai.infura.io/v3/`),
//      defaultConfig: {
//        from : "0xb954de63aAc9dc7D03f82046c4505EA27c16b5e1"
//      }
//    },
//    parent: {
//      provider: new HDWalletProvider(pk, `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`),
//      defaultConfig: {
//        from : "0xb954de63aAc9dc7D03f82046c4505EA27c16b5e1"
//      }
//    }
//}).catch (error => {
//  console.log(error)
//}) ;

const provider = new HDWalletProvider(pk, `https://rinkeby.infura.io/v3/${process.env.INFURA_KEY}`);

module.exports = {
  provider: provider,
  primaryKey: pk
}


