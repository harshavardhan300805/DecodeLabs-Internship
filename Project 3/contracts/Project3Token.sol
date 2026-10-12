// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title Project3Token
 * @notice Educational ERC-20 token for DecodeLabs Blockchain Project 3.
 */
contract Project3Token is ERC20 {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10 ** 18;

    constructor() ERC20("Project 3 Token", "P3T") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
}
