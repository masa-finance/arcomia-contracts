import { PaymentMethod } from "@masa-finance/masa-sdk";

// sbt address
export const sbtAddress = "0xEF9A0b610c511C73aa53bE8985Fd0271C3A3d199";

// sbt friendly name
export const name = "ArcomiaOGCommunitySBT";

// types collection using for verification
export const types = {
  Mint: [
    { name: "to", type: "address" },
    { name: "authorityAddress", type: "address" },
    { name: "signatureDate", type: "uint256" }
  ]
};

export const paymentMethod: PaymentMethod = "ETH";

// the wallet that will mint the sbt and receiver it
export const receiverAddress = "0x8ba2D360323e3cA85b94c6F7720B70aAc8D37a7a";
