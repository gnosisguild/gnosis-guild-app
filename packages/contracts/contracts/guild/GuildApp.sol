// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/SafeERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";

import "../interfaces/IGuild.sol";

contract GuildApp is ERC721Upgradeable, AccessControlUpgradeable, IGuild {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;
    using StringsUpgradeable for uint256;

    struct Subscription {
        uint256 tokenId;
        uint256 expirationTimestamp;
    }

    bool public override initialized;
    bool public isActive;
    string public metadataCID;
    address public tokenAddress; // currently active asset for payments
    uint256 public subPrice;
    uint256 public subscriptionPeriod;

    mapping(address => EnumerableSetUpgradeable.AddressSet) private _approvedTokens;

    mapping(address => Subscription) public subscriptionByOwner;

    modifier onlyIfActive() {
        require(isActive, "GuildApp: The Guild is disabled");
        _;
    }

    modifier onlyGuildAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "GuildApp: Sender doesn't have an Admin role");
        _;
    }

    event InitializedGuild(address _creator,
                           address _tokenAddress,
                           uint256 _subPrice,
                           uint256 _subscriptionPeriod,
                           GuildMetadata _metadata);
    event UpdatedMetadata(string _metadataURI);
    event PausedGuild(bool _isPaused);
    event Withdraw(address _tokenAddress, address beneficiary, uint256 _amount);
    event SubscriptionPriceChanged(address _tokenAddress, uint256 _subPrice);
    event NewSubscription(uint256 _tokenId, uint256 _value, uint256 expiry);
    event RenewSubscription(uint256 _tokenId, uint256 _value, uint256 expiry);

    function __GuildApp_init_unchained(address _creator,
                                       string memory baseURI,
                                       string memory _metadataCID,
                                       address _tokenAddress,
                                       uint256 _subPrice,
                                       uint256 _subscriptionPeriod
                                       ) internal initializer {
        require(
            _tokenAddress == address(0) ||
            (_tokenAddress != address(0) && IERC20Upgradeable(_tokenAddress).totalSupply() > 0),
            "GuildApp: Invalid token");

        isActive = true;
        metadataCID = _metadataCID;
        tokenAddress = _tokenAddress;
        _approvedTokens[address(this)].add(_tokenAddress);
        subPrice = _subPrice;
        subscriptionPeriod =_subscriptionPeriod;
        _setBaseURI(baseURI);
        _setupRole(DEFAULT_ADMIN_ROLE, _creator);
        initialized = true;
    }

    function initialize(address _creator,
                        address _tokenAddress,
                        uint256 _subPrice,
                        uint256 _subscriptionPeriod,
                        GuildMetadata memory _metadata
                        ) public override initializer {
        __AccessControl_init();
        __ERC721_init(_metadata.name, _metadata.symbol);
        __GuildApp_init_unchained(_creator, _metadata.baseURI, _metadata.metadataCID, _tokenAddress, _subPrice, _subscriptionPeriod);
        emit InitializedGuild(_creator, _tokenAddress, _subPrice, _subscriptionPeriod, _metadata);
    }

    function pauseGuild(bool pause) external override onlyGuildAdmin {
        require(isActive == pause, "GuildApp: Guild already in that state");
        emit PausedGuild(pause);
        isActive = !pause;
    }

    function withdraw(address _tokenAddress, uint256 _amount, address _beneficiary) public override onlyGuildAdmin {
        require(_approvedTokens[address(this)].contains(_tokenAddress), "GuildApp: Token has not been approved");
        uint256 outstandingBalance = guildBalance(_tokenAddress);
        require(_amount > 0 && outstandingBalance >= _amount, "GuildApp: Not enough balance to withdraw");
        address beneficiary = _beneficiary != address(0) ? _beneficiary : _msgSender();
        emit Withdraw(tokenAddress, beneficiary, _amount);
        IERC20Upgradeable(tokenAddress).safeTransfer(beneficiary, _amount);
    }

    function updateSubscriptionPrice(address _tokenAddress, uint256 _newSubPrice) public override onlyGuildAdmin onlyIfActive {
        // require(_tokenAddress != address(0), "GuildApp: Invalid token address");
        tokenAddress = _tokenAddress;
        _approvedTokens[address(this)].add(_tokenAddress);
        subPrice = _newSubPrice;
        emit SubscriptionPriceChanged(tokenAddress, subPrice);
    }

    function subscribe(string memory _tokenURI, uint256 _value, bytes calldata /*_data*/) public payable override onlyIfActive {
        address subscriber = _msgSender();
        uint256 value = tokenAddress != address(0) ? _value : msg.value;
        require(value >= subPrice, "GuildApp: Insufficient value sent");
        Subscription storage subs = subscriptionByOwner[subscriber];
        if (subs.tokenId == 0) {
            subs.tokenId = totalSupply().add(1);
            _safeMint(subscriber, subs.tokenId);
            _setTokenURI(subs.tokenId, string(abi.encodePacked(_tokenURI, "#", subs.tokenId.toString())));
            subs.expirationTimestamp = subscriptionPeriod.add(block.timestamp);
            emit NewSubscription(subs.tokenId, value, subs.expirationTimestamp);
        } else {
            // renew or extend subscription
            subs.expirationTimestamp = subs.expirationTimestamp.add(block.timestamp);
            emit RenewSubscription(subs.tokenId, value, subs.expirationTimestamp);
        }
        
        // Handle payment
        if (tokenAddress != address(0)) {
            IERC20Upgradeable(tokenAddress).safeTransferFrom(subscriber, address(this), value);
        }
    }

    function guildBalance(address _tokenAddress) public view override returns (uint256) {
        if (_approvedTokens[address(this)].contains(_tokenAddress)) {
            if (tokenAddress != address(0)) {
                return IERC20Upgradeable(tokenAddress).balanceOf(address(this));
            }
            return address(this).balance;
        }
        return 0;
    }

    function isSubscriptionOwner(uint256 _tokenId, address _holder) public view override returns (bool) {
        return ownerOf(_tokenId) == _holder;
    }

    function hasActiveSubscription(address _account) public view override returns (bool) {
        return subscriptionByOwner[_account].expirationTimestamp > block.timestamp;
    }

    function getSubscriptionIdFor(address _account) public view override returns (uint256) {
        return subscriptionByOwner[_account].tokenId;
    }

    function getSubscriptionExpiryFor(address _account) external view override returns (uint256) {
        return subscriptionByOwner[_account].expirationTimestamp;
    }

    function approvedTokens() public view override returns (address[] memory) {
        address[] memory tokens = new address[](_approvedTokens[address(this)].length());
        for (uint256 i = 0; i < _approvedTokens[address(this)].length(); i++) {
            tokens[i] = _approvedTokens[address(this)].at(i);
        }
        return tokens;
    }

    function getMetadata() public view override returns (string memory) {
        string memory base = baseURI();

        if (bytes(base).length == 0) {
            return metadataCID;
        }
        return string(abi.encodePacked(base, metadataCID));
    }

    function setMetadata(string memory _metadataCID) external override onlyGuildAdmin onlyIfActive {
        metadataCID = _metadataCID;
        emit UpdatedMetadata(getMetadata());
    }
    

    uint256[50] private __gap;

}