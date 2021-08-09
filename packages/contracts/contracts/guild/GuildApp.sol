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
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";

import "../interfaces/IAllowanceModule.sol";
import "../interfaces/IGnosisSafe.sol";
import "../interfaces/IGuild.sol";
import "../utils/SignatureDecoder.sol";

/// @title GuildApp Contract
/// @author RaidGuild
/// @notice Guild app allows you to monetize content and receive recurring subscriptions
/// @dev uses ERC721 standard to tokenize subscriptions
contract GuildApp is ERC721Upgradeable, AccessControlUpgradeable, SignatureDecoder, IGuild {
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using SafeMathUpgradeable for uint256;
    using StringsUpgradeable for uint256;
    using AddressUpgradeable for address;

    struct Subscription {
        uint256 tokenId;
        uint256 expirationTimestamp;
    }

    /// @dev flag the contract as initialized
    bool public override initialized;
    /// @dev flag to keep track if the Guild is accepting subscriptions
    bool public isActive;
    /// @dev CID of Guild metadata stored on i.e. IPFS
    string public metadataCID;
    /// @dev current active asset accepted for subscriptions
    address public tokenAddress;
    /// @dev current guild subcription price
    uint256 public subPrice;
    /// @dev subscription period in seconds (i.e. monthly)
    uint256 public subscriptionPeriod;
    /// @dev subscriptions list
    mapping(address => Subscription) public subscriptionByOwner;
    /// @dev assets used for subscription payments
    mapping(address => EnumerableSetUpgradeable.AddressSet) private _approvedTokens;
    /// @dev Gnosis Safe AllowanceModule
    address private _allowanceModule;
    /// @dev next subscriptionID
    uint256 private _nextId;

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
    event NewSubscription(address _subscriber, uint256 _tokenId, uint256 _value, uint256 expiry, bytes _data);
    event RenewSubscription(address _subscriber, uint256 _tokenId, uint256 _value, uint256 expiry, bytes _data);
    event Unsubscribed(uint256 _tokenId);

    function __GuildApp_init_unchained(address _creator,
                                       string memory baseURI,
                                       string memory _metadataCID,
                                       address _tokenAddress,
                                       uint256 _subPrice,
                                       uint256 _subscriptionPeriod,
                                       address allowanceModule
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
        _nextId = 0;
        _allowanceModule = allowanceModule;
        initialized = true;
    }

    /// @notice Initialize a new GuildApp contract
    /// @dev Initialize inherited contracts and perform base GuildApp setup
    /// @param _creator GuildApp owner
    /// @param _tokenAddress asset to be accepted for payments
    /// @param _subPrice subscription price in WEI
    /// @param _subscriptionPeriod subscription period in seconds
    /// @param _metadata guild metadata CID
    /// @param allowanceModule safe module address
    function initialize(address _creator,
                        address _tokenAddress,
                        uint256 _subPrice,
                        uint256 _subscriptionPeriod,
                        GuildMetadata memory _metadata,
                        address allowanceModule
                        ) public override initializer {
        __AccessControl_init();
        __ERC721_init(_metadata.name, _metadata.symbol);
        __GuildApp_init_unchained(_creator,
                                  _metadata.baseURI,
                                  _metadata.metadataCID,
                                  _tokenAddress,
                                  _subPrice,
                                  _subscriptionPeriod,
                                  allowanceModule);
        emit InitializedGuild(_creator, _tokenAddress, _subPrice, _subscriptionPeriod, _metadata);
    }

    /// @notice Enable/Disable your GuildApp to accept subscription/payments
    /// @dev Flag contract as active or not. Only the guild owner can execute
    /// @param pause boolean to flag the Guild as active
    function pauseGuild(bool pause) external override onlyGuildAdmin {
        require(isActive == pause, "GuildApp: Guild already in that state");
        emit PausedGuild(pause);
        isActive = !pause;
    }

    /// @notice Withdraw balance from the Guild
    /// @dev Only the guild owner can execute
    /// @param _tokenAddress token asset to withdraw some balance
    /// @param _amount amount to be withdraw in wei
    /// @param _beneficiary beneficiary to send funds. If 0x is specified, funds will be sent to the guild owner
    function withdraw(
        address _tokenAddress,
        uint256 _amount,
        address _beneficiary
    ) public override onlyGuildAdmin {
        require(_approvedTokens[address(this)].contains(_tokenAddress), "GuildApp: Token has not been approved");
        uint256 outstandingBalance = guildBalance(_tokenAddress);
        require(_amount > 0 && outstandingBalance >= _amount, "GuildApp: Not enough balance to withdraw");
        address beneficiary = _beneficiary != address(0) ? _beneficiary : _msgSender();
        emit Withdraw(tokenAddress, beneficiary, _amount);
        IERC20Upgradeable(tokenAddress).safeTransfer(beneficiary, _amount);
    }

    /// @notice Update Guild subscription token and price
    /// @dev can be executed only by guild owner and if guild is active
    /// @param _tokenAddress token to be accepted for payments
    /// @param _newSubPrice new subscription price
    function updateSubscriptionPrice(
        address _tokenAddress,
        uint256 _newSubPrice
    ) public override onlyGuildAdmin onlyIfActive {
        tokenAddress = _tokenAddress;
        _approvedTokens[address(this)].add(_tokenAddress);
        subPrice = _newSubPrice;
        emit SubscriptionPriceChanged(tokenAddress, subPrice);
    }

    /// @notice Validate signature belongs to a Safe owner
    /// @dev Currently disabled
    /// @param _safeAddress Gnosis Safe contract
    /// @param _transferhash Tx hash used for signing
    /// @param _data owner signature
    function _validateSignature(
        address _safeAddress,
        bytes32 _transferhash,
        bytes memory _data
    ) internal view {
        // Validate signature belongs to a Safe owner
        IGnosisSafe safe = IGnosisSafe(_safeAddress);
        (uint8 v, bytes32 r, bytes32 s) = signatureSplit(_data, 0);
        address safeOwner;

        if (v > 30) {
            // To support eth_sign and similar we adjust v and hash the messageHash with the Ethereum message prefix before applying ecrecover
            safeOwner = ecrecover(keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _transferhash)), v - 4, r, s);
        } else {
            // Use ecrecover with the messageHash for EOA signatures
            safeOwner = ecrecover(_transferhash, v, r, s);
        }
        require(safe.isOwner(safeOwner), "GuildApp: Signer is not a safe owner");
    }

    /// @notice New subscription to the Guild
    /// @dev Accepts contributions from EOA and Safes w/ enabledAllowanceModule.
    /// @param _subscriber Account address
    /// @param _tokenURI URI of subsription metadata
    /// @param _value subsription payment value send by a user
    /// @param _data allowance Tx signature used by the safe AllowanceModule
    function subscribe(
        address _subscriber,
        string memory _tokenURI,
        uint256 _value,
        bytes memory _data
    ) public payable override onlyIfActive {
        address subscriber = _subscriber;
        uint256 value = _value;
        if (_data.length == 0) {  // condition if not using a safe
            require((tokenAddress != address(0) && msg.value == 0) ||
                    (tokenAddress == address(0) && msg.value == value),
                    "GuildApp: incorrect msg.value");
        } else {
            // require(address(subscriber).isContract() &&
            //         keccak256(abi.encodePacked(IGnosisSafe(subscriber).NAME())) == keccak256(abi.encodePacked("Gnosis Safe")),
            //         "GuildApp: Sender is not a Gnosis Safe");
            require(msg.value == 0,
                    "GuildApp: ETH should be transferred via AllowanceModule");
        }
        require(value >= subPrice, "GuildApp: Insufficient value sent");
        Subscription storage subs = subscriptionByOwner[subscriber];
        
        if (subs.tokenId == 0) {
            require(subscriber == _msgSender(), "GuildApp: msg.sender must be the subscriber");
            _nextId = _nextId.add(1);
            subs.tokenId = _nextId;
            _safeMint(subscriber, subs.tokenId);
            _setTokenURI(subs.tokenId, string(abi.encodePacked(_tokenURI, "#", subs.tokenId.toString())));
            subs.expirationTimestamp = subscriptionPeriod.add(block.timestamp);
            emit NewSubscription(subscriber, subs.tokenId, value, subs.expirationTimestamp, _data);
        } else {
            require(subs.expirationTimestamp < block.timestamp, "GuildApp: sill an active subscription");
            // renew or extend subscription
            subs.expirationTimestamp = subs.expirationTimestamp.add(subscriptionPeriod);
            emit RenewSubscription(subscriber, subs.tokenId, value, subs.expirationTimestamp, _data);
        }
        
        if (tokenAddress != address(0) && _data.length == 0) {
            // Handle payment using EOA allowances
            IERC20Upgradeable(tokenAddress).safeTransferFrom(subscriber, address(this), value);
            return;
        }
        // Else Handle payment using Safe Allowance Module
        require(_allowanceModule != address(0), "GuildApp: Guild does not support Safe Allowances");
        IAllowanceModule safeModule = IAllowanceModule(_allowanceModule);

        safeModule.executeAllowanceTransfer(
            subscriber, // MUST be a safe
            tokenAddress,
            payable(this), // to
            uint96(value),
            address(0), // payment token
            0, // payment
            address(this), // delegate
            "" // bypass signature check as contract signatures are not supported by the module
        );
    }

    /// @notice Unsubscribe to the Guild
    /// @dev NFT token is burned
    /// @param _tokenId Subscription ID
    function unsubscribe(uint256 _tokenId) public override {
        require(_exists(_tokenId), "GuildApp: Subscription does not exist");
        address subscriber = _msgSender();
        require(subscriber == ownerOf(_tokenId), "GuildApp: Caller is not the owner of the subscription");
        _burn(_tokenId);
        Subscription storage subs = subscriptionByOwner[subscriber];
        subs.tokenId = 0;
        subs.expirationTimestamp = 0;
        emit Unsubscribed(_tokenId);
    }

    /// @notice Get the Guild balance of a specified token
    /// @param _tokenAddress asset address
    /// @return current guild balanceOf `_tokenAddres`
    function guildBalance(address _tokenAddress) public view override returns (uint256) {
        if (_approvedTokens[address(this)].contains(_tokenAddress)) {
            if (tokenAddress != address(0)) {
                return IERC20Upgradeable(tokenAddress).balanceOf(address(this));
            }
            return address(this).balance;
        }
        return 0;
    }

    /// @notice Return if `_holder` owns a subscription with ID `_tokenId`
    /// @param _tokenId subsription ID
    /// @param _holder user address
    /// @return true if `_holder` owns the subscription
    function isSubscriptionOwner(
        uint256 _tokenId,
        address _holder
    ) public view override returns (bool) {
        return ownerOf(_tokenId) == _holder;
    }

    /// @notice Return true if `_account` has an active subscription
    /// @param _account subscriber address
    /// @return true if `_account` has an active subscription
    function hasActiveSubscription(address _account) public view override returns (bool) {
        return subscriptionByOwner[_account].expirationTimestamp > block.timestamp;
    }

    /// @notice Get Subscription ID from `_account`
    /// @param _account subscriber address
    /// @return subscription ID that belong to `_account`
    function getSubscriptionIdFor(address _account) public view override returns (uint256) {
        return subscriptionByOwner[_account].tokenId;
    }

    /// @notice Get the subscription expiration timestamp
    /// @param _account subscriber address
    /// @return expiration timestamp in seconds
    function getSubscriptionExpiryFor(address _account) external view override returns (uint256) {
        return subscriptionByOwner[_account].expirationTimestamp;
    }

    /// @notice Return list of approved tokens in the guild
    /// @return array of assets aproved to the Guild
    function approvedTokens() public view override returns (address[] memory) {
        address[] memory tokens = new address[](_approvedTokens[address(this)].length());
        for (uint256 i = 0; i < _approvedTokens[address(this)].length(); i++) {
            tokens[i] = _approvedTokens[address(this)].at(i);
        }
        return tokens;
    }

    /// @notice Return Guild Metadata CID
    /// @return metadataCID (i.e. IPFS hash)
    function getMetadata() public view override returns (string memory) {
        string memory base = baseURI();

        if (bytes(base).length == 0) {
            return metadataCID;
        }
        return string(abi.encodePacked(base, metadataCID));
    }

    /// @notice Set Guild Metadata ID
    /// @dev Only the guild owner can execute
    /// @param _metadataCID new metadata CID
    function setMetadata(string memory _metadataCID) external override onlyGuildAdmin onlyIfActive {
        metadataCID = _metadataCID;
        emit UpdatedMetadata(getMetadata());
    }

    receive() external payable {

    }

    uint256[50] private __gap;

}