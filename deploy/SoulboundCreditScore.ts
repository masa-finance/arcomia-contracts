import hre from "hardhat";
import { getEnvParams } from "../src/EnvParams";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import {
  MASA_GOERLI,
  SWAPROUTER_GOERLI,
  USDC_GOERLI,
  WETH_GOERLI
} from "../src/Constants";

let admin: SignerWithAddress;

const func: DeployFunction = async ({
  // @ts-ignore
  getNamedAccounts,
  // @ts-ignore
  deployments,
  // @ts-ignore
  ethers,
  network
}) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // const currentNonce: number = await ethers.provider.getTransactionCount(deployer);
  // to solve REPLACEMENT_UNDERPRICED, when needed

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);
  const baseUri = `${env.BASE_URI}/credit-score/`;

  const masa = await deployments.get("MASA");
  const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  let swapRouter: string;
  let wrappedNativeToken: string; // weth
  let stableCoin: string; // usdc
  let masaCoin: string; // masa

  if (network.name == "mainnet") {
    // mainnet
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    stableCoin = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    masaCoin = masa.address;
  } else if (network.name == "goerli") {
    // goerli
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    stableCoin = USDC_GOERLI;
    masaCoin = MASA_GOERLI;
  } else if (network.name == "hardhat") {
    // hardhat
    swapRouter = SWAPROUTER_GOERLI;
    wrappedNativeToken = WETH_GOERLI;
    stableCoin = USDC_GOERLI;
    masaCoin = MASA_GOERLI;
  } else if (network.name == "alfajores") {
    // alfajores
    swapRouter = "0xE3D8bd6Aed4F159bc8000a9cD47CffDb95F96121"; // Ubeswap
    wrappedNativeToken = "0xF194afDf50B03e69Bd7D057c1Aa9e10c9954E4C9";
    stableCoin = "0x37f39aD164cBBf0Cc03Dd638472F3FbeC7aE426C";
    masaCoin = masa.address;
  } else {
    throw new Error("Network not supported");
  }

  const constructorArguments = [
    env.ADMIN || admin.address,
    baseUri,
    soulboundIdentityDeployed.address,
    [
      swapRouter,
      wrappedNativeToken,
      stableCoin,
      masaCoin,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  const soulboundCreditScoreDeploymentResult = await deploy(
    "SoulboundCreditScore",
    {
      from: deployer,
      args: constructorArguments,
      log: true
      // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
    }
  );

  // verify contract with etherscan, if its not a local network
  if (network.name == "mainnet" || network.name == "goerli") {
    try {
      await hre.run("verify:verify", {
        address: soulboundCreditScoreDeploymentResult.address,
        constructorArguments
      });
    } catch (error) {
      if (
        !error.message.includes("Contract source code already verified") &&
        !error.message.includes("Reason: Already Verified")
      ) {
        throw error;
      }
    }
  }
};

func.tags = ["SoulboundCreditScore"];
func.dependencies = ["MASA", "SoulboundIdentity"];
export default func;
