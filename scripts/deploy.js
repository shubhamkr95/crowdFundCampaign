const hre = require("hardhat");

async function main() {
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  const myToken = await MyToken.deploy();

  await myToken.deployed();

  console.log(`ERC20 deployed address ${myToken.address}`);

  const CrowdFundManager = await hre.ethers.getContractFactory("CrowdFundManager");
  const crowdFundManager = await CrowdFundManager.deploy(myToken.address);

  await crowdFundManager.deployed();
  console.log(`Crowd fund manager deployed address ${crowdFundManager.address}`);
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
