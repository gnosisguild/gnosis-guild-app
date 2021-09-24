// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";

import "../interfaces/IGuild.sol";

/// @title GuildApp Proxy Factory
/// @author RaidGuild
/// @notice Allows to deploy a new GuildApp contract
/// @dev Based on EIP-1167
contract GuildFactory is Initializable {
    using AddressUpgradeable for address;
    using ClonesUpgradeable for address;
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    /// @dev fixed contract template for EIP-1167 proxy pattern
    address public template;

    /// @dev keep track of total created Guilds
    CountersUpgradeable.Counter private _totalGuilds;

    /// @dev keep track of guild by owner
    mapping(address => EnumerableSetUpgradeable.AddressSet) private _guilds;

    /// @dev new guild event
    event NewGuild(address indexed guildOwner, address indexed guild);

    function __GuildFactory_init_unchained(address _template) internal initializer {
        template = _template;
    }

    function __GuildFactory_init(address _template) internal initializer {
        __GuildFactory_init_unchained(_template);
    }

    /// @notice Initializes the factory contract
    /// @dev Initializes factory contract using a minimal proxy pattern (EIP-1167)
    /// @param _template GuildApp contract address to be used as template
    function initialize(address _template) public {
        __GuildFactory_init(_template);
    }

    /// @notice get list of guilds created by `_owner`
    /// @dev get GuildApp contract addresses created by `_owner`
    /// @param _owner Guild app owner
    /// @return an array of guilds created by `_owner`
    function guildsOf(address _owner) public view returns (address[] memory) {
        address[] memory tokens = new address[](_guilds[_owner].length());
        for (uint256 i = 0; i < _guilds[_owner].length(); i++) {
            tokens[i] = _guilds[_owner].at(i);
        }
        return tokens;
    }

    /// @notice get the total amount of existing guilds
    /// @return total amount of deployed guilds
    function totalGuilds() public view returns (uint256) {
        return _totalGuilds.current();
    }
 
    /// @dev call GuildApp initialize function encoded in `_initData` and register the contract
    /// @param _instance GuildApp contract address
    /// @param _sender GuildApp owner
    /// @param _initData Encoded GuildApp initialize function
    function _initAndEmit(address _instance, address _sender, bytes calldata _initData) private {
        _totalGuilds.increment();
        emit NewGuild(_sender, _instance);
        if (_initData.length > 0) {
            _instance.functionCall(_initData);
        }
        IGuild guild = IGuild(_instance);
        require(guild.initialized(), "GuildFactory: GuildApp not initialized");
        _guilds[_sender].add(_instance);
    }

    /// @dev Clone the template using EIP-1167 and initlize the new deployment
    /// @param _initData Encoded GuildApp initialize function
    function clone(bytes calldata _initData) internal {
        address sender = msg.sender;
        _initAndEmit(template.clone(), sender, _initData);
    }

    /// @dev Clone the template using EIP-1167 + CREATE2 and initlize the new deployment
    /// @param _initData Encoded GuildApp initialize function
    /// @param _salt salt used for deploying the contract
    function cloneDeterministic(bytes calldata _initData, bytes32 _salt) internal {
        address sender = msg.sender;
        _initAndEmit(template.cloneDeterministic(_salt), sender, _initData);
    }

    /// @notice Obtains the address that will be assigned to a new GuildApp contract
    /// @dev 
    /// @param _salt salt used for deploying the contract
    /// @return predicted contract address
    function predictDeterministicAddress(bytes32 _salt) public view returns (address predicted) {
        return template.predictDeterministicAddress(_salt);
    }

    /// @notice deploy a new GuildApp
    /// @dev deploy a new GuildApp using the EIP-1167 Proxy pattern
    /// @param _initData Encoded GuildApp initialize function
    function createGuild(bytes calldata _initData) external {
        require(template != address(0), "GuildFactory: Missing Guild Template");
        clone(_initData);

    }

    // This is empty reserved space in storage that is put in place in Upgradeable contracts.
    // It allows us to freely add new state variables in the future without compromising the
    // storage compatibility with existing deployments
    // The size of the __gap array is calculated so that the amount of storage used by a contract
    // always adds up to the same number
    uint256[47] private __gap;

}