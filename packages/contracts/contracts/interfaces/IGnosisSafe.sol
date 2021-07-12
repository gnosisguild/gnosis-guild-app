// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface GnosisSafe {
    function isOwner(address owner) external view returns (bool);
    function signatureSplit(bytes memory signatures, uint256 pos) external pure returns (
        uint8,
        bytes32,
        bytes32
    );
}