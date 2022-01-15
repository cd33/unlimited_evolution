// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UnlimitedEvolution.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */
 
contract RandomNumberGenerator is VRFConsumerBase, Ownable {
    
    bytes32 internal keyHash;
    uint256 internal fee;

    UnlimitedEvolution unlimited;
    UnlimitedEvolution.type_character typeCharacter;
    UnlimitedEvolution.gender_character genderCharacter;
    address requestor;

    event requestedRandomness(bytes32 _requestId);
    
    /**
     * Constructor inherits VRFConsumerBase
     * 
     * Network: Mumbai
     * Chainlink VRF Coordinator address: 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
     * LINK token address:                0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Key Hash: 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
     */
    constructor() 
        VRFConsumerBase(
            0x8C7382F9D8f56b33781fE506E897a4F1e2d17255, // VRF Coordinator
            0x326C977E6efc84E512bB9C30f76E30c160eD06FB  // LINK Token
        )
    {
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 100000000000000; // 0.0001 LINK
    }

    /** 
     * Change the address of the contract UnlimitedEvolution
     */
    function setUnlimitedAddress(address _unlimited) external onlyOwner {
        unlimited = UnlimitedEvolution(_unlimited);
    }

    /** 
     * Requests randomness 
     */
    function getRandomNumber(UnlimitedEvolution.type_character _typeCharacter, UnlimitedEvolution.gender_character _genderCharacter, address _address) public {
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        typeCharacter = _typeCharacter;
        genderCharacter = _genderCharacter;
        requestor = _address;
        bytes32 requestId = requestRandomness(keyHash, fee);
        emit requestedRandomness(requestId);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        require(randomness > 0, "Randomness number not found");
        unlimited.createCharacter(typeCharacter, genderCharacter, randomness % 10**16, requestor);
    }

    /**
     * Withdraw Link
     */
    function withdraw(uint256 value) external onlyOwner {
        LINK.transfer(msg.sender, value);
    }
}