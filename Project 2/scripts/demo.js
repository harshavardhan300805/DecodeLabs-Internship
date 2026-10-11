const hre = require("hardhat");

async function main() {
  const [chairperson, voter1, voter2, voter3, unauthorized] =
    await hre.ethers.getSigners();

  const VotingProtocol = await hre.ethers.getContractFactory("VotingProtocol");
  const voting = await VotingProtocol.deploy();
  await voting.waitForDeployment();

  console.log("============================================================");
  console.log("DECODELABS - PROJECT 2: DECENTRALIZED VOTING");
  console.log("============================================================");
  console.log("Contract:", await voting.getAddress());
  console.log("Chairperson:", chairperson.address);

  await voting.addProposal("Alpha");
  await voting.addProposal("Beta");
  await voting.addProposal("Gamma");

  await voting.giveRightToVote(voter1.address);
  await voting.giveRightToVote(voter2.address);
  await voting.giveRightToVote(voter3.address);

  console.log("\nAuthorized voters:");
  console.log("Voter 1:", voter1.address);
  console.log("Voter 2:", voter2.address);
  console.log("Voter 3:", voter3.address);

  console.log("\nVoting:");
  await voting.connect(voter1).vote(0);
  await voting.connect(voter2).vote(2);
  await voting.connect(voter3).vote(2);
  console.log("Alpha: 1 vote");
  console.log("Beta : 0 votes");
  console.log("Gamma: 2 votes");

  console.log("\nDynamic winner:");
  const winnerIndex = await voting.winningProposal();
  console.log("Winning proposal index:", winnerIndex.toString());
  console.log(
    "Winning proposal:",
    hre.ethers.decodeBytes32String(await voting.winnerName())
  );

  console.log("\nSecurity checks:");
  try {
    await voting.connect(unauthorized).vote(1);
  } catch (error) {
    console.log("Unauthorized vote rejected: PASS");
  }

  try {
    await voting.connect(voter1).vote(1);
  } catch (error) {
    console.log("Double vote rejected: PASS");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
