import { providers, Wallet } from "ethers";
import { Masa } from "@masa-finance/masa-sdk";

const pk = process.env.PRIVATE_KEY as string;

if (!pk) throw new Error("Please do export PRIVATE_KEY");

const provider = new providers.JsonRpcProvider(
  "https://rpc-mumbai.maticvigil.com"
);

const wallet = new Wallet(pk).connect(provider);
console.log("Current wallet", wallet.address);

export const masa = new Masa({
  signer: wallet,
  networkName: "mumbai",
  environment: "beta",
  verbose: true
});
