<!-- @format -->

# CrowdFund Campaign

This is a crowdfunding platform where users can pledge funds to and claim funds from the contract

## Working

1. Crowdfunded projects have a funding goal
2. When a funding goal is not met, customers are be able to get a refund of their pledged funds
3. can check state changes using events logs

## requirement

- [NodeJS](https://nodejs.org/en/)
  - You'll know you've installed nodejs right if you can run: node --version and get an output like: vx.x.x

## Testing

```
git clone https://github.com/shubhamkr95/crowdFundCampaign.git

cd NFT-DAO

npm install

npx hardhat compile

npx hardhat test

npx hardhat coverage
```

## Deployed address

ERC20 address: [0xEe226b201D3F846617a5CE3B28be2B1696B9078F](https://goerli.etherscan.io/address/0xEe226b201D3F846617a5CE3B28be2B1696B9078F)

CrowdFundManager address: [0xEe9E85057d463930c4dF379Beb6Cb3cd757ED5ac](https://goerli.etherscan.io/address/0xEe9E85057d463930c4dF379Beb6Cb3cd757ED5ac)
