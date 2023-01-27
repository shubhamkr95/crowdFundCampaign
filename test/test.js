const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mineBlock } = require("../utils/mineBlock");


describe("CrowdFunding", function () {
  let MyToken
  let myToken;
  let CrowdFundManager
  let crowdFundManager;

  beforeEach(async () => {
    [deployer, campaignCreator, account3, account4] = await ethers.getSigners();

    MyToken = await hre.ethers.getContractFactory("MyToken");
    myToken = await MyToken.deploy();

    await myToken.deployed();

    CrowdFundManager = await hre.ethers.getContractFactory("CrowdFundManager");
    crowdFundManager = await CrowdFundManager.deploy(myToken.address);

    await crowdFundManager.deployed();
  })

  it("Should create campaign instance", async () => {
    let campaignName = "Campaign1";
    let maxFunding = ethers.utils.parseEther("20")
    let expire = await crowdFundManager.maxDuration()
    let expireAt = expire.toString() - 2000

    let Tx = await crowdFundManager.connect(campaignCreator).createCampaign(campaignName, maxFunding, expireAt)
    let receipt = await Tx.wait()
    let campaignAddress = receipt.events[0].args[0]

    let count = await crowdFundManager.count()
    let parseCount = count.toString()

    let campaignInfo = await crowdFundManager.campaigns(parseCount)
    expect(campaignInfo.campaign).to.equal(campaignAddress)
  })

  it("Should deposit and refund funds", async () => {
    await myToken.connect(deployer).transfer(account3.address, ethers.utils.parseEther("40"))

    console.log("Balance of account3", await myToken.balanceOf(account3.address));

    let campaignName = "Campaign1";
    let maxFunding = ethers.utils.parseEther("20")
    let expire = await crowdFundManager.maxDuration()
    let expireAt = expire.toString() - 2000

    let Tx = await crowdFundManager.connect(campaignCreator).createCampaign(campaignName, maxFunding, expireAt)
    await Tx.wait()

    let count = await crowdFundManager.count()
    let parseCount = count.toString()

    let campaignInfo = await crowdFundManager.campaigns(parseCount)
    let campaignAddress = campaignInfo.campaign;
    console.log("campaign creator address", campaignInfo.creator);

    let CrowdFund = await ethers.getContractFactory("CrowdFund")
    let crowdFund = CrowdFund.attach(campaignAddress)

    await myToken.connect(account3).approve(crowdFund.address, ethers.utils.parseEther("20"))
    console.log("Campaign contract allowance from Account3", await myToken.allowance(account3.address, crowdFund.address));

    await crowdFund.connect(account3).depositFundsToCampaign(ethers.utils.parseEther("10"))

    expect(await crowdFund.contractBalance()).to.equal(ethers.utils.parseEther("10"))
    console.log("Campaign contract balance ", ethers.utils.formatEther(await crowdFund.contractBalance(), "18"));

    let acc3InvestedAmount = await crowdFund.investors(account3.address)
    console.log("Account3 invested amount ", ethers.utils.formatEther(acc3InvestedAmount, "18"));

    await crowdFund.connect(account3).refundFunds(ethers.utils.parseEther("5"))
    console.log("Campaign contract remaining balance ", ethers.utils.formatEther(await crowdFund.contractBalance(), "18"));
    let acc3RemainingInvestedAmount = await crowdFund.investors(account3.address)
    console.log("Account3 remaining invested amount", ethers.utils.formatEther(acc3RemainingInvestedAmount, "18"));
  })

  it("creator should withdraw all amount", async () => {
    await myToken.connect(deployer).transfer(account3.address, ethers.utils.parseEther("40"))

    let campaignName = "Campaign1";
    let maxFunding = ethers.utils.parseEther("20")
    let expire = await crowdFundManager.maxDuration()
    let expireAt = expire.toString() - 2000

    let Tx = await crowdFundManager.connect(campaignCreator).createCampaign(campaignName, maxFunding, expireAt)
    await Tx.wait()

    let count = await crowdFundManager.count()
    let parseCount = count.toString()

    let campaignInfo = await crowdFundManager.campaigns(parseCount)
    let campaignAddress = campaignInfo.campaign;

    let CrowdFund = await ethers.getContractFactory("CrowdFund")
    let crowdFund = CrowdFund.attach(campaignAddress)

    await myToken.connect(account3).approve(crowdFund.address, ethers.utils.parseEther("20"))

    await crowdFund.connect(account3).depositFundsToCampaign(ethers.utils.parseEther("10"))

    await crowdFund.connect(account3).refundFunds(ethers.utils.parseEther("5"))

    await crowdFund.connect(campaignCreator).withdrawFunds(account4.address)
    console.log("Campaign contract remaining balance ", ethers.utils.formatEther(await crowdFund.contractBalance(), "18"));
    console.log("Account4 balance ", ethers.utils.formatEther(await myToken.balanceOf(account4.address), "18"));
  })

  it("Should fail deposit when goal reached and time expires", async () => {
    await myToken.connect(deployer).transfer(account3.address, ethers.utils.parseEther("40"))

    let campaignName = "Campaign1";
    let maxFunding = ethers.utils.parseEther("20")
    let expire = await crowdFundManager.maxDuration()
    let expireAt = expire.toString() - 2000

    let Tx = await crowdFundManager.connect(campaignCreator).createCampaign(campaignName, maxFunding, expireAt)
    await Tx.wait()

    let count = await crowdFundManager.count()
    let parseCount = count.toString()

    let campaignInfo = await crowdFundManager.campaigns(parseCount)
    let campaignAddress = campaignInfo.campaign;

    let CrowdFund = await ethers.getContractFactory("CrowdFund")
    let crowdFund = CrowdFund.attach(campaignAddress)

    await myToken.connect(account3).approve(crowdFund.address, ethers.utils.parseEther("20"))

    await expect(crowdFund.connect(account3).depositFundsToCampaign(ethers.utils.parseEther("30"))).to.be.reverted

    console.log("expiresAt", await crowdFund.endDate());

    console.log("current timestamp", await crowdFund.currentTime());
    await mineBlock(3000)
    await expect(crowdFund.connect(account3).depositFundsToCampaign(ethers.utils.parseEther("10"))).to.be.reverted

    console.log("After mining 3000 blocks", await crowdFund.currentTime());
  })

  it("Should failed withdraw when time expires", async () => {
    await myToken.connect(deployer).transfer(account3.address, ethers.utils.parseEther("40"))

    let campaignName = "Campaign1";
    let maxFunding = ethers.utils.parseEther("20")
    let expire = await crowdFundManager.maxDuration()
    let expireAt = expire.toString() - 2000

    let Tx = await crowdFundManager.connect(campaignCreator).createCampaign(campaignName, maxFunding, expireAt)
    await Tx.wait()

    let count = await crowdFundManager.count()
    let parseCount = count.toString()

    let campaignInfo = await crowdFundManager.campaigns(parseCount)
    let campaignAddress = campaignInfo.campaign;

    let CrowdFund = await ethers.getContractFactory("CrowdFund")
    let crowdFund = CrowdFund.attach(campaignAddress)

    await myToken.connect(account3).approve(crowdFund.address, ethers.utils.parseEther("20"))

    await crowdFund.connect(account3).depositFundsToCampaign(ethers.utils.parseEther("20"))

    await mineBlock(3000)
    await expect(crowdFund.connect(campaignCreator).withdrawFunds(campaignCreator.address)).to.be.reverted
  })
});
