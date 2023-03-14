import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";

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
  const baseUri = `${env.BASE_URI}`;

  const constructorArguments = [
    env.ADMIN || admin.address,
    env.ARCOMIAOGCOMMUNITYSBT_NAME,
    env.ARCOMIAOGCOMMUNITYSBT_SYMBOL,
    baseUri,
    ethers.constants.AddressZero,
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.RESERVE_WALLET || admin.address
    ]
  ];

  const arcomiaSBTDeploymentResult = await deploy("ArcomiaOGCommunitySBT", {
    from: deployer,
    args: constructorArguments,
    log: true
    // nonce: currentNonce + 1 // to solve REPLACEMENT_UNDERPRICED, when needed
  });

  // verify contract with etherscan, if its not a local network or celo
  if (network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: arcomiaSBTDeploymentResult.address,
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

  if (network.name === "hardhat" || network.name === "mumbai") {
    const signer = env.ADMIN
      ? new ethers.Wallet(getPrivateKey(network.name), ethers.provider)
      : admin;

    const arcomiaSBT = await ethers.getContractAt(
      "ArcomiaOGCommunitySBT",
      arcomiaSBTDeploymentResult.address
    );

    // add authority to ArcomiaOGCommunitySBT
    await arcomiaSBT
      .connect(signer)
      .addAuthority(env.AUTHORITY_WALLET || admin.address);
  }
};

func.tags = ["ArcomiaOGCommunitySBT"];
func.dependencies = [];
export default func;