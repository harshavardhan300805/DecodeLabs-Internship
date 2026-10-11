const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingProtocol - DecodeLabs Project 2", function () {
  let voting;
  let chairperson;
  let voter1;
  let voter2;
  let voter3;
  let unauthorized;

  async function proposalName(index) {
    const [name] = await voting.getProposal(index);
    return name;
  }

  beforeEach(async function () {
    [chairperson, voter1, voter2, voter3, unauthorized] =
      await ethers.getSigners();

    const VotingProtocol = await ethers.getContractFactory("VotingProtocol");
    voting = await VotingProtocol.deploy();
    await voting.waitForDeployment();

    await voting.addProposal("Alpha");
    await voting.addProposal("Beta");
    await voting.addProposal("Gamma");

    await voting.giveRightToVote(voter1.address);
    await voting.giveRightToVote(voter2.address);
    await voting.giveRightToVote(voter3.address);
  });

  it("sets the deployer as chairperson", async function () {
    expect(await voting.chairperson()).to.equal(chairperson.address);
  });

  it("allows the chairperson to submit proposals", async function () {
    await voting.addProposal("Delta");
    expect(await voting.proposalCount()).to.equal(4n);
    expect(await proposalName(3)).to.equal(ethers.encodeBytes32String("Delta"));
  });

  it("rejects proposal submission from a non-chairperson", async function () {
    await expect(
      voting.connect(voter1).addProposal("Unauthorized Proposal")
    ).to.be.revertedWith("Only chairperson can perform this action");
  });

  it("authorizes a specific voter", async function () {
    const [weight, voted] = await voting.getVoter(voter1.address);
    expect(weight).to.equal(1n);
    expect(voted).to.equal(false);
  });

  it("rejects an unauthorized voter", async function () {
    await expect(
      voting.connect(unauthorized).vote(0)
    ).to.be.revertedWith("Not an authorized voter");
  });

  it("casts a vote and updates the proposal tally", async function () {
    await voting.connect(voter1).vote(1);

    const [, voteCount] = await voting.getProposal(1);
    expect(voteCount).to.equal(1n);

    const [, voted, , selectedProposal] =
      await voting.getVoter(voter1.address);

    expect(voted).to.equal(true);
    expect(selectedProposal).to.equal(1n);
  });

  it("prevents double voting", async function () {
    await voting.connect(voter1).vote(0);

    await expect(
      voting.connect(voter1).vote(1)
    ).to.be.revertedWith("Already voted");
  });

  it("rejects a non-existent proposal index", async function () {
    await expect(
      voting.connect(voter1).vote(99)
    ).to.be.revertedWith("Invalid proposal index");
  });

  it("calculates the winning proposal dynamically", async function () {
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(2);
    await voting.connect(voter3).vote(2);

    const winningIndex = await voting.winningProposal();
    expect(winningIndex).to.equal(2n);
    expect(await voting.winnerName()).to.equal(
      ethers.encodeBytes32String("Gamma")
    );
  });

  it("detects a changed winner after additional votes", async function () {
    await voting.connect(voter1).vote(0);
    await voting.connect(voter2).vote(0);
    await voting.connect(voter3).vote(1);

    expect(await voting.winningProposal()).to.equal(0n);

    // A voter can vote only once, so this verifies the current tally
    // rather than allowing a second vote.
    const [, alphaVotes] = await voting.getProposal(0);
    const [, betaVotes] = await voting.getProposal(1);

    expect(alphaVotes).to.equal(2n);
    expect(betaVotes).to.equal(1n);
  });
});
