const { ethers } = require("hardhat");

const mineBlock = async (n) => {
 for (let i = 0; i < n; i++) {
  await ethers.provider.send("evm_mine");

 }
}

module.exports = { mineBlock }