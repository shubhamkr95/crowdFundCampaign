// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MyToken.sol";

contract CrowdFund {
    IERC20 token;
    string public campaignName;
    uint256 public fundingGoal;
    uint256 public startDate;
    uint256 public endDate;
    address public campaignCreator;
    address public campaignToken;
    bool public withdrawAllFunds;

    event depositFunds(
        address indexed invester,
        address indexed campaign,
        uint256 amount
    );

    event refund(
        address indexed campaign,
        address indexed investor,
        uint256 amount
    );

    event withdrawnAllFunds(
        address indexed campaign,
        address indexed receiver,
        uint amount
    );

    mapping(address => uint256) public investors;

    modifier onlyInvestor() {
        require(
            investors[msg.sender] > 0,
            "cannot refund against zero investment"
        );
        _;
    }

    modifier isExpired() {
        require(block.timestamp <= endDate, "Campaign date is expired");
        _;
    }

    modifier isFunded() {
        require(
            token.balanceOf(address(this)) < fundingGoal,
            "Funding goal reached"
        );
        _;
    }

    modifier onlyCampaignOwner() {
        require(msg.sender == campaignCreator, "caller is not campaign owner");
        _;
    }

    constructor(
        string memory _campaignName,
        uint256 _fundingGoal,
        uint256 _startAt,
        uint256 _expiresAt,
        address _creator,
        address _tokenAddress
    ) {
        campaignName = _campaignName;
        fundingGoal = _fundingGoal;
        startDate = _startAt;
        endDate = _expiresAt;
        campaignCreator = _creator;
        campaignToken = _tokenAddress;
        token = IERC20(_tokenAddress);
    }

    function depositFundsToCampaign(
        uint256 _amount
    ) external isExpired isFunded {
        uint256 balance = token.balanceOf(address(this));
        require(
            _amount + balance <= fundingGoal,
            "amount exceeds funding goal"
        );
        require(_amount > 0, "Amount is greater than zero");

        investors[msg.sender] += _amount;
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Deposit failed"
        );
        emit depositFunds(msg.sender, address(this), _amount);
    }

    function withdrawFunds(
        address _receiver
    ) external onlyCampaignOwner isExpired {
        require(_receiver != address(0), "cannot be zero adress");
        require(withdrawAllFunds == false, "funds already withdrawn");

        uint256 amount = token.balanceOf(address(this));
        require(token.transfer(_receiver, amount), "Withdraw failed");

        withdrawAllFunds = true;
        emit withdrawnAllFunds(address(this), _receiver, address(this).balance);
    }

    function refundFunds(uint256 _amount) external onlyInvestor {
        require(
            investors[msg.sender] >= _amount,
            "refund amount greator than investment"
        );
        require(_amount > 0, "Amount should be greater than zero");

        investors[msg.sender] -= _amount;
        require(token.transfer(msg.sender, _amount), "Refund failed");

        emit refund(address(this), msg.sender, _amount);
    }

    function contractBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function currentTime() external view returns (uint256) {
        return block.timestamp;
    }
}
