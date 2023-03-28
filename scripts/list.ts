import { masa } from "./masa";
import { receiverAddress, sbtAddress } from "./sbt";

const list = async (tokenOwnerAddress: string): Promise<void> => {
  const { list } = await masa.sbt.connect(sbtAddress);
  const SBTs = await list(tokenOwnerAddress);
  console.log({ SBTs });
};

void list(receiverAddress);
