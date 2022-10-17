import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { ethers, deployments, getChainId } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  SoulboundCreditReport,
  SoulboundCreditReport__factory,
  SoulboundIdentity,
  SoulboundIdentity__factory,
  SoulLinker,
  SoulLinker__factory
} from "../typechain";
import { BigNumber } from "ethers";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let soulboundIdentity: SoulboundIdentity;
let soulboundCreditReport: SoulboundCreditReport;
let soulLinker: SoulLinker;

let admin: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

let identityId1: number;
let creditReport1: number;

describe("Soul Linker", () => {
  before(async () => {
    [, admin, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("SoulboundIdentity", { fallbackToGlobal: false });
    await deployments.fixture("SoulboundCreditReport", {
      fallbackToGlobal: false
    });
    await deployments.fixture("SoulLinker", { fallbackToGlobal: false });

    const { address: soulboundIdentityAddress } = await deployments.get(
      "SoulboundIdentity"
    );
    const { address: soulboundCreditReportAddress } = await deployments.get(
      "SoulboundCreditReport"
    );
    const { address: soulLinkerAddress } = await deployments.get("SoulLinker");

    soulboundIdentity = SoulboundIdentity__factory.connect(
      soulboundIdentityAddress,
      admin
    );
    soulboundCreditReport = SoulboundCreditReport__factory.connect(
      soulboundCreditReportAddress,
      admin
    );
    soulLinker = SoulLinker__factory.connect(soulLinkerAddress, admin);

    // we mint identity SBT for address1
    let mintTx = await soulboundIdentity.connect(admin).mint(address1.address);
    let mintReceipt = await mintTx.wait();

    identityId1 = mintReceipt.events![0].args![2].toNumber();

    // we mint credit report SBT for address1
    mintTx = await soulboundCreditReport.connect(admin).mint(address1.address);
    mintReceipt = await mintTx.wait();

    creditReport1 = mintReceipt.events![0].args![2].toNumber();
  });

  describe("admin functions", () => {
    it("should set SoulboundIdentity from admin", async () => {
      await soulLinker.connect(admin).setSoulboundIdentity(address1.address);

      expect(await soulLinker.soulboundIdentity()).to.be.equal(
        address1.address
      );
    });

    it("should fail to set SoulboundIdentity from non admin", async () => {
      await expect(
        soulLinker.connect(address1).setSoulboundIdentity(address1.address)
      ).to.be.rejected;
    });

    it("should add linked SBT from admin", async () => {
      await soulLinker.connect(admin).addLinkedSBT(address1.address);

      expect(await soulLinker.linkedSBT(address1.address)).to.be.true;
    });

    it("should fail to add linked SBT from non admin", async () => {
      await expect(soulLinker.connect(address1).addLinkedSBT(address1.address))
        .to.be.rejected;
    });

    it("should fail to add already existing linked SBT from admin", async () => {
      await expect(
        soulLinker.connect(admin).addLinkedSBT(soulboundCreditReport.address)
      ).to.be.rejected;
    });

    it("should remove linked SBT from admin", async () => {
      await soulLinker
        .connect(admin)
        .removeLinkedSBT(soulboundCreditReport.address);

      expect(await soulLinker.linkedSBT(soulboundCreditReport.address)).to.be
        .false;
    });

    it("should fail to remove linked SBT from non admin", async () => {
      await expect(
        soulLinker
          .connect(address1)
          .removeLinkedSBT(soulboundCreditReport.address)
      ).to.be.rejected;
    });

    it("should fail to remove non existing linked SBT from admin", async () => {
      await expect(soulLinker.connect(admin).removeLinkedSBT(address1.address))
        .to.be.rejected;
    });
  });

  describe("read link information", () => {
    it("should get identity id", async () => {
      expect(
        await soulLinker.getIdentityId(
          soulboundCreditReport.address,
          creditReport1
        )
      ).to.be.equal(identityId1);
    });

    it("should get SBT links by identityId", async () => {
      expect(
        await soulLinker["getSBTLinks(uint256,address)"](
          identityId1,
          soulboundCreditReport.address
        )
      ).to.deep.equal([BigNumber.from(creditReport1)]);
    });

    it("should get SBT links by owner address", async () => {
      expect(
        await soulLinker["getSBTLinks(address,address)"](
          address1.address,
          soulboundCreditReport.address
        )
      ).to.deep.equal([BigNumber.from(creditReport1)]);
    });
  });

  describe("validateLinkData", () => {
    it("validateLinkData must work with a valid signature", async () => {
      const chainId = await getChainId();

      const signature = await address1._signTypedData(
        // Domain
        {
          name: "SoulLinker",
          version: "1.0.0",
          chainId: chainId,
          verifyingContract: soulLinker.address
        },
        // Types
        {
          Link: [
            { name: "reader", type: "address" },
            { name: "identityId", type: "uint256" },
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
            { name: "expirationDate", type: "uint256" }
          ]
        },
        // Value
        {
          reader: address2.address,
          identityId: identityId1,
          token: soulboundCreditReport.address,
          tokenId: creditReport1,
          expirationDate: Math.floor(Date.now() / 1000) + 60 * 15
        }
      );

      const isValid = await soulLinker.connect(address2).validateLinkData(
        address2.address,
        identityId1,
        soulboundCreditReport.address,
        creditReport1,
        Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes from the current Unix time
        signature
      );

      expect(isValid).to.be.true;
    });
  });
});
