import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { deployments, ethers, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  ArcomiaOGCommunitySBT,
  ArcomiaOGCommunitySBT__factory
} from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let arcomiaSBT: ArcomiaOGCommunitySBT;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;
let authority: SignerWithAddress;

const signatureDate = Math.floor(Date.now() / 1000);

let signatureToAddress: string;

const signMintToAddress = async (
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
      verifyingContract: arcomiaSBT.address
    },
    // Types
    {
      Mint: [
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

describe("Arcomia OG Community SBT", () => {
  before(async () => {
    [, owner, address1, address2, authority] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("ArcomiaOGCommunitySBT", {
      fallbackToGlobal: true
    });

    const { address: arcomiaSBTAddress } = await deployments.get(
      "ArcomiaOGCommunitySBT"
    );

    arcomiaSBT = ArcomiaOGCommunitySBT__factory.connect(
      arcomiaSBTAddress,
      owner
    );

    // we add authority account
    await arcomiaSBT.addAuthority(authority.address);

    signatureToAddress = await signMintToAddress(address1.address, authority);
  });

  describe("owner functions", () => {
    it("should set SoulboundIdentity from owner", async () => {
      await arcomiaSBT.connect(owner).setSoulboundIdentity(address1.address);

      expect(await arcomiaSBT.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non owner", async () => {
      await expect(
        arcomiaSBT.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await arcomiaSBT.name()).to.equal("Arcomia OG SBT");

      expect(await arcomiaSBT.symbol()).to.equal("AOG");
    });
  });

  describe("mint", () => {
    it("should fail to mint from owner address", async () => {
      await expect(
        arcomiaSBT
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
      await arcomiaSBT
        .connect(address1)
        ["mint(address,address,address,uint256,bytes)"](
          ethers.constants.AddressZero,
          address1.address,
          authority.address,
          signatureDate,
          signatureToAddress
        );
      await expect(
        arcomiaSBT
          .connect(address1)
          ["mint(address,address,address,uint256,bytes)"](
            ethers.constants.AddressZero,
            address1.address,
            authority.address,
            signatureDate,
            signatureToAddress
          )
      ).to.be.revertedWith("SBTAlreadyCreated");
      expect(await arcomiaSBT.totalSupply()).to.equal(1);
      expect(await arcomiaSBT.tokenByIndex(0)).to.equal(0);
    });

    it("should mint from final user address", async () => {
      const mintTx = await arcomiaSBT
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

    it("should mint to an address, with an Arcomia SBT not linked to an identity SC", async () => {
      const signatureToAddress2 = await signMintToAddress(
        address2.address,
        authority
      );
      const mintTx = await arcomiaSBT
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
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await arcomiaSBT
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

      expect(await arcomiaSBT.balanceOf(address1.address)).to.be.equal(1);
      expect(await arcomiaSBT["ownerOf(uint256)"](tokenId1)).to.be.equal(
        address1.address
      );

      await arcomiaSBT.connect(address1).burn(tokenId1);
      expect(await arcomiaSBT.balanceOf(address1.address)).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await arcomiaSBT
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
      const tokenUri = await arcomiaSBT.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("arcomia.io/");
    });
  });
});
