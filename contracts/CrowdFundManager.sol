// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CrowdFund.sol";

contract CrowdFundManager is Ownable {
    uint256 public year = 5000;
    address public manager;
    address public tokenAddress;

    struct Campaign {
        string name;
        uint goal;
        uint startAt;
        uint endAt;
        address creator;
        address campaign;
    }

    event CampaignCreated(
        address indexed _campaign,
        uint256 indexed _startAt,
        uint256 indexed _endAt
    );

    uint public count;
    uint public maxDuration;

    mapping(uint => Campaign) public campaigns;

    constructor(address _erc20Address) {
        maxDuration = block.timestamp + year;
        manager = msg.sender;
        tokenAddress = _erc20Address;
    }

    function createCampaign(
        string memory _campaignName,
        uint256 _maxFunding,
        uint256 _expireAt
    ) external {
        require(
            _expireAt > block.timestamp,
            "expireAt is less than current time"
        );

        require(bytes(_campaignName).length > 0, "campaign name is empty");
        require(_expireAt <= maxDuration, "expireAt greater than max duration");
        require(_maxFunding > 0, "Funding goal is invalid");

        count++;
        address newCampaign = address(
            new CrowdFund(
                _campaignName,
                _maxFunding,
                block.timestamp,
                _expireAt,
                msg.sender,
                tokenAddress
            )
        );

        campaigns[count] = Campaign(
            _campaignName,
            _maxFunding,
            block.timestamp,
            _expireAt,
            msg.sender,
            newCampaign
        );

        emit CampaignCreated(newCampaign, block.timestamp, _expireAt);
    }
}
