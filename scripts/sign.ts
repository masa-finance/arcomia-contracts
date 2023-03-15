import { masa } from "./masa";
import { address, name, receiver, types } from "./sbt";
import {
  ArcomiaOGCommunitySBT,
  ArcomiaOGCommunitySBT__factory
} from "../typechain";

const sign = async (receiver: string): Promise<void> => {
  const signatureDate = Date.now();

  // fill the collection with data
  const value: {
    to: string;
    authorityAddress: string;
    signatureDate: number;
  } = {
    to: receiver,
    authorityAddress: await masa.config.wallet.getAddress(),
    signatureDate
  };

  const { sign } = await masa.contracts.sbt<ArcomiaOGCommunitySBT>(
    address,
    ArcomiaOGCommunitySBT__factory
  );

  // sign to create a signature
  const signResult = await sign(name, types, value);
  if (!signResult) return;

  const { signature, authorityAddress } = signResult;

  console.log({ signature, authorityAddress, signatureDate });
};

void sign(receiver);
