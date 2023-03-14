import {
  getCoinMarketCapApiKey,
  getEtherscanApiKey,
  getPolygonscanApiKey,
  getPrivateKey
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

const networks: NetworksUserConfig = {
  hardhat: {
    hardfork: "istanbul",
    allowUnlimitedContractSize: true,
    gasPrice: "auto",
    gas: 13000000,
    forking: {
      url: "https://rpc-mumbai.maticvigil.com"
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
