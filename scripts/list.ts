import { masa } from "./masa";
import { address } from "./sbt";

const list = async (tokenOwnerAddress: string): Promise<void> => {
  const { list } = await masa.sbt.connect(address);
  const SBTs = await list(tokenOwnerAddress);
  console.log({ SBTs });
};

void list("0x8ba2D360323e3cA85b94c6F7720B70aAc8D37a7a");
