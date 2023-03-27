import { PaymentMethod } from "@masa-finance/masa-sdk";

// sbt address
export const address = "0x5B4715cDC765DcD5860986c1A06d51E06ee24439";

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
export const receiver = "0x8ba2D360323e3cA85b94c6F7720B70aAc8D37a7a";
