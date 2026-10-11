const hre = require("hardhat");

async function main() {
  const VotingProtocol = await hre.ethers.getContractFactory("VotingProtocol");
  const voting = await VotingProtocol.deploy();
  await voting.waitForDeployment();

  console.log("VotingProtocol deployed to:", await voting.getAddress());
  console.log("Chairperson:", await voting.chairperson());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
