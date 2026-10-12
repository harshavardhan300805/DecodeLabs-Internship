const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Project4NFT", function () {
  async function deployFixture() {
    const [owner, secondAccount] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("Project4NFT");
    const nft = await NFT.deploy();
    await nft.waitForDeployment();

    return { nft, owner, secondAccount };
  }

  it("should mint an NFT and assign ownership to the caller", async function () {
    const { nft, owner } = await deployFixture();
    const metadataURI = "metadata/nft-1.json";

    const tx = await nft.mintNFT(metadataURI);
    await tx.wait();

    expect(await nft.ownerOf(1)).to.equal(owner.address);
    expect(await nft.tokenURI(1)).to.equal(metadataURI);
  });

  it("should create unique token IDs", async function () {
    const { nft, owner } = await deployFixture();

    await (await nft.mintNFT("metadata/nft-1.json")).wait();
    await (await nft.mintNFT("metadata/nft-1.json")).wait();

    expect(await nft.ownerOf(1)).to.equal(owner.address);
    expect(await nft.ownerOf(2)).to.equal(owner.address);
    expect(await nft.ownerOf(1)).to.not.equal(ethers.ZeroAddress);
    expect(await nft.ownerOf(2)).to.not.equal(ethers.ZeroAddress);
  });

  it("should allow another account to mint its own NFT", async function () {
    const { nft, secondAccount } = await deployFixture();

    await (await nft.connect(secondAccount).mintNFT("metadata/nft-1.json")).wait();

    expect(await nft.ownerOf(1)).to.equal(secondAccount.address);
  });

  it("should reject an empty metadata URI", async function () {
    const { nft } = await deployFixture();

    await expect(nft.mintNFT("")).to.be.revertedWith("Metadata URI required");
  });
});
