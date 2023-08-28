import hre from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DeployFunction } from "hardhat-deploy/dist/types";
import { getEnvParams, getPrivateKey } from "../src/EnvParams";

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

  let identityAddress =
    addresses[network.name == "hardhat" ? "alfajores" : network.name]
      .SoulboundIdentity;
  if (!identityAddress) {
    throw new Error(
      `SoulboundIdentity address not found for network ${network.name}`
    );
  }

  const soulNameDeployed = await deployments.get("ArcomiaSoulName");

  const constructorArguments = [
    env.ADMIN || admin.address,
    identityAddress,
    soulNameDeployed.address,
    env.SOULNAME_PRICE_5LEN, // 5+ length price
    [
      env.SWAP_ROUTER,
      env.WETH_TOKEN,
      env.USDC_TOKEN,
      env.MASA_TOKEN,
      env.PROJECTFEE_RECEIVER || admin.address,
      env.PROTOCOLFEE_RECEIVER || ethers.constants.AddressZero,
      env.PROTOCOLFEE_AMOUNT || 0,
      env.PROTOCOLFEE_PERCENT || 0,
      env.PROTOCOLFEE_PERCENT_SUB || 0
    ]
  ];

  const soulStoreDeploymentResult = await deploy("ArcomiaSoulStore", {
    from: deployer,
    args: constructorArguments,
    log: true
  });

  // verify contract with etherscan, if its not a local network or celo
  if (network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: soulStoreDeploymentResult.address,
        contract: "contracts/ArcomiaSoulStore.sol:ArcomiaSoulStore",
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

  if (
    network.name === "hardhat" ||
    network.name === "mumbai" ||
    network.name === "alfajores"
  ) {
    const signer = env.ADMIN
      ? new ethers.Wallet(getPrivateKey(network.name), ethers.provider)
      : admin;

    // we set the registration prices per year and length of name
    const soulStore = await ethers.getContractAt(
      "SoulStore",
      soulStoreDeploymentResult.address
    );
    await soulStore
      .connect(signer)
      .setNameRegistrationPricePerYear(1, env.SOULNAME_PRICE_1LEN); // 1 length
    await soulStore
      .connect(signer)
      .setNameRegistrationPricePerYear(2, env.SOULNAME_PRICE_2LEN); // 2 length
    await soulStore
      .connect(signer)
      .setNameRegistrationPricePerYear(3, env.SOULNAME_PRICE_3LEN); // 3 length
    await soulStore
      .connect(signer)
      .setNameRegistrationPricePerYear(4, env.SOULNAME_PRICE_4LEN); // 4 length

    // add authorities to soulStore
    const authorities = (env.AUTHORITY_WALLET || admin.address).split(" ");
    for (let i = 0; i < authorities.length; i++) {
      await soulStore.connect(signer).addAuthority(authorities[i]);
    }

    // we add soulStore as soulboundIdentity and soulName minter
    if (soulNameDeployed.address !== ethers.constants.AddressZero) {
      const soulName = await ethers.getContractAt(
        "SoulName",
        soulNameDeployed.address
      );

      const NAME_MINTER_ROLE = await soulName.MINTER_ROLE();
      await soulName
        .connect(signer)
        .grantRole(NAME_MINTER_ROLE, soulStoreDeploymentResult.address);
    }

    // we add payment methods
    const paymentMethods = env.PAYMENT_METHODS_SOULSTORE.split(" ");
    for (let i = 0; i < paymentMethods.length; i++) {
      await soulStore.connect(signer).enablePaymentMethod(paymentMethods[i]);
    }
  }
};

func.tags = ["ArcomiaSoulStore"];
func.dependencies = ["ArcomiaSoulName"];
export default func;
