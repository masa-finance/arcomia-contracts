import {
  getPrivateKey,
  getInfuraApiKey,
  getCoinMarketCapApiKey,
  getEtherscanApiKey,
  getPolygonscanApiKey
} from "./src/EnvParams";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-solhint";
import "@nomiclabs/hardhat-etherscan";
import "@primitivefi/hardhat-dodoc";
import "@typechain/ethers-v5";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { NetworksUserConfig } from "hardhat/types";

const getInfuraURL = (network: string) => {
  return `https://${network}.infura.io/v3/${getInfuraApiKey()}`;
};

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
    forking: {
      url: getInfuraURL("goerli")
    }
  },
  mumbai: {
    url: "https://rpc-mumbai.maticvigil.com",
    chainId: 80001,
    accounts: [getPrivateKey("mumbai")]
  },
  polygon: {
    url: "https://polygon-rpc.com/",
    chainId: 137,
    accounts: [getPrivateKey("polygon")]
  },
  goerli: {
    url: getInfuraURL("goerli"),
    chainId: 5,
    accounts: [getPrivateKey("goerli")],
    gas: "auto", // 20000000
    gasPrice: 200000000000 //"auto"
  },
  mainnet: {
    url: getInfuraURL("mainnet"),
    chainId: 1,
    accounts: [getPrivateKey("mainnet")],
    gas: "auto", // 20000000
    gasPrice: "auto" // 100000000000
  }
};

export default {
  networks,

  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
        details: {
          yul: false
        }
      }
    }
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: getPolygonscanApiKey(),
      polygon: getPolygonscanApiKey(),
      goerli: getEtherscanApiKey(),
      mainnet: getEtherscanApiKey()
    }
  },
  gasReporter: {
    currency: "USD",
    coinmarketcap: getCoinMarketCapApiKey()
  },
  dodoc: {},
  typechain: {
    outDir: "typechain"
  }
};
