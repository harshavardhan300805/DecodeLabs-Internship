const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Project3Token", function () {
  async function deployToken() {
    const [owner, recipient] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("Project3Token");
    const token = await Token.deploy();
    await token.waitForDeployment();
    return { token, owner, recipient };
  }

  it("mints the initial supply to the deployer", async function () {
    const { token, owner } = await deployToken();
    expect(await token.balanceOf(owner.address)).to.equal(
      await token.INITIAL_SUPPLY()
    );
  });

  it("returns balances through balanceOf", async function () {
    const { token, owner } = await deployToken();
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(await token.INITIAL_SUPPLY());
  });

  it("transfers tokens successfully", async function () {
    const { token, owner, recipient } = await deployToken();
    const amount = ethers.parseUnits("100", 18);

    await expect(token.transfer(recipient.address, amount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, recipient.address, amount);

    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    expect(await token.balanceOf(owner.address)).to.equal(
      (await token.INITIAL_SUPPLY()) - amount
    );
  });

  it("rejects a transfer greater than the sender balance", async function () {
    const { token, owner, recipient } = await deployToken();
    const balance = await token.balanceOf(owner.address);
    const tooMuch = balance + 1n;

    await expect(
      token.transfer(recipient.address, tooMuch)
    ).to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
  });

  it("rejects a zero-address recipient", async function () {
    const { token } = await deployToken();

    await expect(
      token.transfer(ethers.ZeroAddress, 1n)
    ).to.be.revertedWithCustomError(token, "ERC20InvalidReceiver");
  });
});
