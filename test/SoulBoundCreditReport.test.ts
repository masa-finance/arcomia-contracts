// @ts-ignore
import chai from "chai";
// @ts-ignore
import chaiAsPromised from "chai-as-promised";
import {
  // @ts-ignore
  ethers,
  // @ts-ignore
  deployments,
} from "hardhat";
import type * as ethersTypes from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

chai.use(chaiAsPromised);
const expect = chai.expect;

// contract instances
let soulBoundCreditReport: ethersTypes.Contract;

let owner: SignerWithAddress;
let someone: SignerWithAddress;

describe("Soulbound Credit Report", () => {
  before(async () => {
    [, owner, someone] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulBoundCreditReport", {
      fallbackToGlobal: false,
    });

    const { address: soulBoundCreditReportAddress } = await deployments.get(
      "SoulBoundCreditReport"
    );
    soulBoundCreditReport = await ethers.getContractAt(
      "SoulBoundCreditReport",
      soulBoundCreditReportAddress
    );
  });

  describe("mint", () => {
    it("should mint from owner", async () => {
      await soulBoundCreditReport.connect(owner).mint(someone.address);
    });

    it("should mint twice", async () => {
      await soulBoundCreditReport.connect(owner).mint(someone.address);
      await soulBoundCreditReport.connect(owner).mint(someone.address);
    });

    it("should fail to mint from someone", async () => {
      await expect(
        soulBoundCreditReport.connect(someone).mint(someone.address)
      ).to.be.rejectedWith(
        "ERC721PresetMinterPauserAutoId: must have minter role to mint"
      );
    });
  });

  describe("transfer", () => {
    it("should fail to transfer because its soulbound", async () => {
      await soulBoundCreditReport.connect(owner).mint(someone.address);

      await expect(
        soulBoundCreditReport
          .connect(someone)
          .transferFrom(someone.address, someone.address, 1)
      ).to.be.rejectedWith("Transferring soulbound Tokens is not permitted!");
    });
  });

  describe("tokenUri", () => {
    it("should fail to transfer because its soulbound", async () => {
      const mintTx = await soulBoundCreditReport
        .connect(owner)
        .mint(someone.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events[0].args[2].toNumber();
      const tokenUri = await soulBoundCreditReport.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("/credit-report/");
    });
  });
});
