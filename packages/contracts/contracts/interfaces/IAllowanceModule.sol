// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

interface IAllowanceModule {

    function executeAllowanceTransfer(
        address safe,
        address token,
        address payable to,
        uint96 amount,
        address paymentToken,
        uint96 payment,
        address delegate,
        bytes memory signature
    ) external;

    function generateTransferHash(
        address safe,
        address token,
        address to,
        uint96 amount,
        address paymentToken,
        uint96 payment,
        uint16 nonce
    ) external view returns (bytes32);

    function getTokenAllowance(address safe, address delegate, address token) external view returns (uint256[5] memory);
}