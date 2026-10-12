const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying Project3Token with:", deployer.address);

  const Token = await hre.ethers.getContractFactory("Project3Token");
  const token = await Token.deploy();

  await token.waitForDeployment();

  console.log("Project3Token deployed to:", await token.getAddress());
  console.log("Deployer balance:", (await token.balanceOf(deployer.address)).toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
