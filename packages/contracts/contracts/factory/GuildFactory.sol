// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma abicoder v2;

import "@openzeppelin/contracts-upgradeable/proxy/ClonesUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/EnumerableSetUpgradeable.sol";

import "../interfaces/IGuild.sol";

contract GuildFactory is Initializable {
    using AddressUpgradeable for address;
    using ClonesUpgradeable for address;
    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;

    address public template; // fixed template for minion using eip-1167 proxy pattern

    mapping(address => EnumerableSetUpgradeable.AddressSet) private _guilds;

    event NewGuild(address indexed guildOwner, address indexed guild);

    function __GuildFactory_init_unchained(address _template) internal initializer {
        template = _template;
    }

    function __GuildFactory_init(address _template) internal initializer {
        __GuildFactory_init_unchained(_template);
    }

    function initialize(address _template) public {
        __GuildFactory_init(_template);
    }

    function guildsOf(address _owner) public view returns (address[] memory) {
        address[] memory tokens = new address[](_guilds[_owner].length());
        for (uint256 i = 0; i < _guilds[_owner].length(); i++) {
            tokens[i] = _guilds[_owner].at(i);
        }
        return tokens;
    }

    function _initAndEmit(address _instance, address _sender, bytes calldata _initData) private {
        emit NewGuild(_sender, _instance);
        if (_initData.length > 0) {
            _instance.functionCall(_initData);
        }
        IGuild guild = IGuild(_instance);
        require(guild.initialized(), "GuildFactory: GuildApp not initialized");
        _guilds[_sender].add(_instance);
    }

    function clone(bytes calldata _initData) internal {
        address sender = msg.sender;
        _initAndEmit(template.clone(), sender, _initData);
    }

    function cloneDeterministic(bytes calldata _initData, bytes32 _salt) internal {
        address sender = msg.sender;
        _initAndEmit(template.cloneDeterministic(_salt), sender, _initData);
    }

    function predictDeterministicAddress(bytes32 _salt) public view returns (address predicted) {
        return template.predictDeterministicAddress(_salt);
    }

    function createGuild(bytes calldata _initData) external {
        require(template != address(0), "GuildFactory: Missing Guild Template");
        clone(_initData);

    }

    function createGuild(bytes calldata _initData, bytes32 _salt) public {
        require(template != address(0), "GuildFactory: Missing Guild Template");
        // TODO: prepend msg.sender to salt. NOTICE: predict DeterministicAddress should be changed as well
        // // create lock
        // bytes32 salt;
        // // solium-disable-next-line
        // assembly {
        //     let pointer := mload(0x40)
        //     // The salt is the msg.sender
        //     mstore(pointer, shl(96, caller))
        //     // followed by the _salt provided
        //     mstore(add(pointer, 0x14), _salt)
        //     salt := mload(pointer)
        // }
        // cloneDeterministic(_initData, salt);
        cloneDeterministic(_initData, _salt);
    }

    // This is empty reserved space in storage that is put in place in Upgradeable contracts.
    // It allows us to freely add new state variables in the future without compromising the
    // storage compatibility with existing deployments
    // The size of the __gap array is calculated so that the amount of storage used by a contract
    // always adds up to the same number
    uint256[50] private __gap;

}