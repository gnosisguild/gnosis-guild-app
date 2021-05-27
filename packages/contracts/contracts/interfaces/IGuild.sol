// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface IGuild is IERC721Upgradeable {

    struct GuildMetadata {
        string name;
        string symbol;
        string baseURI;
        string metadataCID;
    }

    function initialized() external view returns (bool);

    function initialize(address _creator,
                        address _tokenAddress,
                        uint256 _subPrice,
                        uint256 _subscriptionPeriod,
                        GuildMetadata calldata _metadata
                        ) external;

    function pauseGuild(bool pause) external;

    function withdraw(address _tokenAddress, uint256 _amount, address _beneficiary) external;

    function updateSubscriptionPrice(address _tokenAddress, uint256 _newSubPrice) external;

    function subscribe(string calldata _tokenURI, uint256 _value, bytes calldata _data) external payable;

    function guildBalance(address _tokenAddress) external view returns (uint256);

    function isSubscriptionOwner(uint256 _tokenId, address _holder) external view returns (bool);

    function hasActiveSubscription(address _account) external view returns (bool);

    function getSubscriptionIdFor(address _account) external view returns (uint256);

    function getSubscriptionExpiryFor(address _account) external view returns (uint256);

    function approvedTokens() external view returns (address[] calldata);

    function getMetadata() external view returns (string calldata);

    function setMetadata(string calldata _metadataCID) external;


    // function isSubscriber(uint256 _tokenId, address _owner) external view returns (bool);

    // function subscriptionExpires(address _owner) external view returns (uint timestamp);

    // function totalSubscribers() external view returns (uint256);

    // function updateMetadata(string calldata _name, string calldata _symbol) external;

    // ERC721 methods

    // function name() external view virtual returns (string calldata);

    // function symbol() external view virtual returns (string calldata);

    // function tokenURI(uint256 tokenId) external view virtual returns (string calldata);

    // function baseURI() external view virtual returns (string calldata);

    // function tokenOfOwnerByIndex(address owner, uint256 index) external view virtual returns (uint256);

    // function totalSupply() external view virtual returns (uint256);

    // function tokenByIndex(uint256 index) external view virtual returns (uint256);




}