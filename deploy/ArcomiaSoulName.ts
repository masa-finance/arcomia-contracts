import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams } from "../src/EnvParams";

import addresses from "@masa-finance/masa-contracts-identity/addresses.json";

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

  [, admin] = await ethers.getSigners();
  const env = getEnvParams(network.name);

  // const soulboundIdentityDeployed = await deployments.get("SoulboundIdentity");

  let identityAddress = addresses[network.name].SoulboundIdentity;
  if (!identityAddress) {
    throw new Error(
      `SoulboundIdentity address not found for network ${network.name}`
    );
  }

  const constructorArguments = [
    env.ADMIN || admin.address,
    env.SOULNAME_NAME,
    env.SOULNAME_SYMBOL,
    identityAddress,
    env.SOULNAME_EXTENSION || ".soul",
    env.SOUL_NAME_CONTRACT_URI
  ];

  const soulNameDeploymentResult = await deploy("ArcomiaSoulName", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  // verify contract with etherscan, if its not a local network or celo
  if (network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: soulNameDeploymentResult.address,
        contract: "contracts/ArcomiaSoulName.sol:ArcomiaSoulName",
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

func.tags = ["ArcomiaSoulName"];
func.dependencies = [""];
export default func;
