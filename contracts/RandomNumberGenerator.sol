// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./UnlimitedEvolution.sol";

/** @title Random Number Generator */
contract RandomNumberGenerator is VRFConsumerBase, Ownable {
    
    bytes32 internal keyHash;
    uint256 internal fee;

    UnlimitedEvolution unlimited;
    UnlimitedEvolution.type_character typeCharacter;
    UnlimitedEvolution.gender_character genderCharacter;
    address requestor;

    /**
     * @dev Emitted when getRandomNumber has been successfully executed. Return the ID unique to a single request.
     */
    event requestedRandomness(bytes32 _requestId);
    
    /**
     * @dev Constructor inherits VRFConsumerBase
     * Network: Mumbai
     * Chainlink VRF Coordinator address: 0x8C7382F9D8f56b33781fE506E897a4F1e2d17255
     * LINK token address: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Key Hash: 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4
     */
    constructor() 
        VRFConsumerBase(
            0x8C7382F9D8f56b33781fE506E897a4F1e2d17255,
            0x326C977E6efc84E512bB9C30f76E30c160eD06FB
        )
    {
        keyHash = 0x6e75b569a01ef56d18cab6a8e71e6600d6ce853834d4a5748b720d06f878b3a4;
        fee = 100000000000000; // 0.0001 LINK
    }

    /** 
     * @dev Change the address of the contract UnlimitedEvolution.
     * @param _unlimited Address of the contract UnlimitedEvolution.
     */
    function setUnlimitedAddress(address _unlimited) external onlyOwner {
        unlimited = UnlimitedEvolution(_unlimited);
    }

    /** 
     * @dev Requests randomness 
     * @param _typeCharacter Type of character between BRUTE, SPIRITUAL, ELEMENTARY.
     * @param _genderCharacter Gender of character between MASCULINE, FEMININE, OTHER.
     * @param _address Address of the original requestor.
     */
    function getRandomNumber(UnlimitedEvolution.type_character _typeCharacter, UnlimitedEvolution.gender_character _genderCharacter, address _address) external {
        require(msg.sender == address(unlimited), "Not allowed to use this function");
        require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK - fill contract with faucet");
        typeCharacter = _typeCharacter;
        genderCharacter = _genderCharacter;
        requestor = _address;
        bytes32 requestId = requestRandomness(keyHash, fee);
        emit requestedRandomness(requestId);
    }

    /**
     * @dev Callback function used by VRF Coordinator
     * @param requestId Id initially returned by requestRandomness.
     * @param randomness Random number generated by Chainlink VRF.
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        require(randomness > 0, "Randomness number not found");
        unlimited.createCharacter(typeCharacter, genderCharacter, randomness % 10**16, requestor);
    }

    /**
     * @dev Owner withdraws an amount of LINK.
     * @param value Amount of LINK.
     */
    function withdraw(uint256 value) external onlyOwner {
        LINK.transfer(msg.sender, value);
    }
}