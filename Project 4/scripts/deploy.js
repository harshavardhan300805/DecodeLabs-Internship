const hre = require("hardhat");

async function main() {
  const NFT = await hre.ethers.getContractFactory("Project4NFT");
  const nft = await NFT.deploy();

  await nft.waitForDeployment();

  const address = await nft.getAddress();

  console.log("Project 4 NFT deployed successfully.");
  console.log("NFT Contract Address:", address);
  console.log("Network:", hre.network.name);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
