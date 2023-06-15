import { masa } from "./masa";
import { name, receiverAddress, sbtAddress, types } from "./sbt";
import { ArcomiaOGCommunitySBT__factory } from "../typechain";

const sign = async (receiver: string): Promise<void> => {
  const signatureDate = Date.now();

  // fill the collection with data
  const value: {
    to: string;
    authorityAddress: string;
    signatureDate: number;
  } = {
    to: receiver,
    authorityAddress: await masa.config.signer.getAddress(),
    signatureDate
  };

  const { sign } = await masa.contracts.sssbt.connect(
    sbtAddress,
    ArcomiaOGCommunitySBT__factory
  );

  // sign to create a signature
  const signResult = await sign(name, types, value);
  if (!signResult) return;

  const { signature, authorityAddress } = signResult;

  console.log({ signature, authorityAddress, signatureDate });
};

void sign(receiverAddress);
