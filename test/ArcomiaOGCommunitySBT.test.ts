import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ArcomiaOGCommunitySBT,
  ArcomiaOGCommunitySBT__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let arcomiaOGCommunitySBT: ArcomiaOGCommunitySBT;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

const signatureDate = Math.floor(Date.now() / 1000);

let signatureToAddress: string;

const signMintCreditGreenToAddress = async (
  to: string,
  authoritySigner: SignerWithAddress
) => {
  const chainId = await getChainId();

  const signature = await authoritySigner._signTypedData(
    // Domain
    {
      name: "ArcomiaOGCommunitySBT",
      version: "1.0.0",
      chainId: chainId,
      verifyingContract: arcomiaOGCommunitySBT.address
    },
    // Types
    {
      MintGreen: [
        { name: "to", type: "address" },
        { name: "authorityAddress", type: "address" },
        { name: "signatureDate", type: "uint256" }
      ]
    },
    // Value
    {
      to: to,
      authorityAddress: authoritySigner.address,
      signatureDate: signatureDate
    }
  );

  return signature;
};

describe("Soulbound Two-factor authentication (Green)", () => {
  before(async () => {
    [, owner, address1, address2, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("ArcomiaOGCommunitySBT", {
      fallbackToGlobal: true
    });

    const { address: soulboundGreenAddress } = await deployments.get(
      "ArcomiaOGCommunitySBT"
    );

    arcomiaOGCommunitySBT = ArcomiaOGCommunitySBT__factory.connect(
      soulboundGreenAddress,
      owner
    );

    // we add authority account
    await arcomiaOGCommunitySBT.addAuthority(authority.address);

    await arcomiaOGCommunitySBT.setMintPrice(0); // 0 USDC

    signatureToAddress = await signMintCreditGreenToAddress(
      address1.address,
      authority
    );
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await arcomiaOGCommunitySBT
        .connect(owner)
        .setSoulboundIdentity(address1.address);

      expect(await arcomiaOGCommunitySBT.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        arcomiaOGCommunitySBT
          .connect(address1)
          .setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await arcomiaOGCommunitySBT.name()).to.equal("Masa Green");

      expect(await arcomiaOGCommunitySBT.symbol()).to.equal("MG-2FA");
    });
  });

  describe("mint", () => {
    it("should fail to mint from owner address", async () => {
      await expect(
        arcomiaOGCommunitySBT
          .connect(owner)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress
          )
      ).to.be.revertedWith("CallerNotOwner");
    });

    it("should mint twice", async () => {
      await arcomiaOGCommunitySBT
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      await arcomiaOGCommunitySBT
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );

      expect(await arcomiaOGCommunitySBT.totalSupply()).to.equal(2);
      expect(await arcomiaOGCommunitySBT.tokenByIndex(0)).to.equal(0);
      expect(await arcomiaOGCommunitySBT.tokenByIndex(1)).to.equal(1);
    });

    it("should mint from final user address", async () => {
      const mintTx = await arcomiaOGCommunitySBT
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      const mintReceipt = await mintTx.wait();

      const toAddress = mintReceipt.events![1].args![1];

      expect(toAddress).to.equal(address1.address);
    });

    it("should mint to an address, with a Green SBT not linked to an identity SC", async () => {
      // we set the identity SC to 0x0
      await arcomiaOGCommunitySBT.setSoulboundIdentity(
        ethers.constants.AddressZero
      );

      const signatureToAddress2 = await signMintCreditGreenToAddress(
        address2.address,
        authority
      );
      const mintTx = await arcomiaOGCommunitySBT
        .connect(address2)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address2.address,
          authority.address,
          signatureDate,
          signatureToAddress2
        );
      const mintReceipt = await mintTx.wait();

      const toAddress = mintReceipt.events![1].args![1];

      expect(toAddress).to.equal(address2.address);

      const tokenId = mintReceipt.events![0].args![1].toNumber();

      // check that this Green is not linked to an identity
      await expect(
        arcomiaOGCommunitySBT.getIdentityId(tokenId)
      ).to.be.revertedWith("NotLinkedToAnIdentitySBT");
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await arcomiaOGCommunitySBT
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await arcomiaOGCommunitySBT
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(
        await arcomiaOGCommunitySBT.balanceOf(address1.address)
      ).to.be.equal(2);
      expect(
        await arcomiaOGCommunitySBT.balanceOf(address1.address)
      ).to.be.equal(2);
      expect(
        await arcomiaOGCommunitySBT["ownerOf(uint256)"](tokenId1)
      ).to.be.equal(address1.address);
      expect(
        await arcomiaOGCommunitySBT["ownerOf(uint256)"](tokenId2)
      ).to.be.equal(address1.address);

      await arcomiaOGCommunitySBT.connect(address1).burn(tokenId1);

      expect(
        await arcomiaOGCommunitySBT.balanceOf(address1.address)
      ).to.be.equal(1);

      await arcomiaOGCommunitySBT.connect(address1).burn(tokenId2);

      expect(
        await arcomiaOGCommunitySBT.balanceOf(address1.address)
      ).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await arcomiaOGCommunitySBT
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await arcomiaOGCommunitySBT.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/green/");
    });
  });
});
