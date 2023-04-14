import { masa } from "./masa";
import { name, paymentMethod, sbtAddress, types } from "./sbt";
import {
  ArcomiaOGCommunitySBT,
  ArcomiaOGCommunitySBT__factory
} from "../typechain";
import { Messages } from "@masa-finance/masa-sdk";

const mint = async (
  signature: string,
  authorityAddress: string,
  signatureDate: number
): Promise<void> => {
  // evaluate receiver
  const to = await masa.config.wallet.getAddress();

  // fill the collection with data
  const value: {
    to: string;
    authorityAddress: string;
    signatureDate: number;
  } = {
    to,
    authorityAddress,
    signatureDate
  };

  const { selfSovereignSBT, prepareMint } =
    await masa.contracts.sbt.connect<ArcomiaOGCommunitySBT>(
      sbtAddress,
      ArcomiaOGCommunitySBT__factory
    );

  if (!selfSovereignSBT) return;

  // prepare mint operation
  const prepareMintResults = await prepareMint(
    paymentMethod,
    name,
    types,
    value,
    signature,
    authorityAddress
  );

  if (!prepareMintResults) return;

  const { paymentAddress, price } = prepareMintResults;

  console.log({ paymentAddress, price });

  const mintParameters: [string, string, string, number, string] = [
    paymentAddress,
    to,
    authorityAddress,
    signatureDate,
    signature
  ];

  const mintOverrides = {
    value: price
  };

  console.log({ mintParameters, mintOverrides });

  const operation = "mint(address,address,address,uint256,bytes)";

  // estimate gas
  const gasLimit = selfSovereignSBT.estimateGas[operation](
    ...mintParameters,
    mintOverrides
  );

  const transaction = await selfSovereignSBT[operation](...mintParameters, {
    ...mintOverrides,
    gasLimit
  });

  console.log(Messages.WaitingToFinalize(transaction.hash));

  const receipt = await transaction.wait();

  console.log("minted in block:", receipt.blockNumber);
};

void mint(
  "0x753406e4958cb75dd73657c5c3914bd4818a42208e0ba3e20f2b4edd2ee69317630d200ded180a8fb329aeb5929d2e8233517ab4c7a86e343b4c9832dc0b8d471c",
  "0x3c8D9f130970358b7E8cbc1DbD0a1EbA6EBE368F",
  1678803572720
);
