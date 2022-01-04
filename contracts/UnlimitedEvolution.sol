// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./RandomNumberGenerator.sol";

/** @title Unlimited Evolution */
contract UnlimitedEvolution is ERC1155, Ownable, RandomNumberGenerator {

    constructor() ERC1155("") {}

    enum type_character { BRUTE, SPIRITUAL, ELEMENTARY }
    enum gender_character { MASCULINE, FEMININE, OTHER }

    uint256 mintFee = 0.001 ether;
    uint256 randomNumber;
    uint24 nextId;
    uint24 limitMint = 4000;
    uint24[] countMints = new uint8[](3);

    // Only for tests, to avoid chainlink
    bool public testMode;

    struct Character {
        uint24 id;
        uint56 dna;
        uint16 level;
        uint24 xp;
        uint24 hp;
        uint24 stamina;
        uint24 attack1;
        uint24 attack2;
        uint24 attack3;
        uint24 attack4;
        uint24 attributePoints;
        uint256 lastFight;
        type_character typeCharacter;
        gender_character genderCharacter;
    }

    // Mapping from token ID to account balances
    mapping(uint256 => Character) private _characterDetails;

    // Mapping from account to his number of NFTs
    mapping(address => uint8) private _balanceOfCharacters;

    /**
     * @dev Emitted when the character with "id" is created.
     */
    event CharacterCreated(uint256 id);

    /**
     * @dev Emitted when the character with "id" is rested, he recovers health points and stamina.
     */
    event Rested(uint256 tokenId);

    /**
     * @dev Emitted when the character with "myTokenId" removes "substrateLifeToRival" points of hp to "rivalTokenId" and the character with "rivalTokenId" removes "substrateLifeToMe" points of hp to "myTokenId".
     */
    event Fighted(uint256 myTokenId, uint256 rivalTokenId, uint256 substrateLifeToRival, uint256 substrateLifeToMe);
    
    /**
     * @dev Emitted when the character with "tokenId" has gained enough experience points to increase one level.
     */
    event LevelUp(uint256 tokenId, uint256 level);

    /**
     * @dev Emitted when the owner changes the ether fee for minting with the amount "mintFee".
     */
    event FeeUpdated(uint256 mintFee);

    /**
     * @dev Emitted when the owner changes the mintable NFT limit with the amount "limitMint".
     */
    event LimitUpdated(uint256 limitMint);

    // Only for tests, to avoid chainlink
    function testModeSwitch() external onlyOwner {
        testMode = !testMode;
    }
    
    /**
     * @dev The function changes the ether fee for minting.
     * @param _mintFee New amount of fee.
     * Emits a "FeeUpdated" event.
     */
    function updateFee(uint256 _mintFee) external onlyOwner() {
        mintFee = _mintFee;
        emit FeeUpdated(mintFee);
    }

    /**
     * @dev The function changes the mintable NFT limit.
     * @param _limitMint New limit of mintable NFT.
     * Emits a "LimitUpdated" event.
     */
    function updateLimitMint(uint24 _limitMint) external onlyOwner() {
        limitMint = _limitMint;
        emit LimitUpdated(limitMint);
    }
    
    /**
     * @dev Owner withdraws the entire amount of ETH.
     */
    function withdraw() external onlyOwner() {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Owner withdraws an amount of LINK.
     * @param value Value of LINK.
     */
    function withdrawLINK(uint256 value) external onlyOwner {
        LINK.transfer(owner(), value);
    }

    /**
     * @dev Tip to simulate the function ownerOf of ERC721, check if msg.sender is owner of the token.
     * @param _tokenId Id of the token.
     */
    function _ownerOf(uint256 _tokenId) private view returns (bool) {
        return balanceOf(msg.sender, _tokenId) != 0;
    }

    /**
     * @dev The function uses the chainlink requestRandomness of VRFConsumerBase.
     * @param _mod Length of number needed (modulo).
     */
    function _generateRandomNumber(uint256 _mod) internal {
        if (!testMode) { // Only for tests, to avoid chainlink
            randomNumber = uint256(getRandomNumber()) % _mod;
        } else {
            randomNumber = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % _mod;
        }
    }

    /**
     * @dev The function assigns a number between 3 and 5 randomly to the attack characteristics using "randomNumber".
     */
    function _attributesMintDistribution() private view returns(uint8[] memory) {
        uint8[] memory _attributes = new uint8[](4);
        for(uint8 i=0; i<4; i++) {
            _attributes[i] = 3 + uint8((randomNumber % (10+i)) % 3); // idée nft: la lose ou la win, tu obtiens 0 ou 10 points bonus
        }
        return _attributes;
    }

    /**
     * @dev One experience point is added and if the experience number reaches % 10 == 0 then the NFT increases one level and gains 10 points to attribute to his stats.
     * @param _tokenId Id of the token.
     * Emits a "LevelUp" event.
     */
    function _xpLevelUp(uint256 _tokenId) private {
        _characterDetails[_tokenId].xp++;
        if (_characterDetails[_tokenId].xp % 10 == 0) {
            _characterDetails[_tokenId].level++;
            _characterDetails[_tokenId].attributePoints += 10;
            emit LevelUp(_tokenId, _characterDetails[_tokenId].level);
        }
    }

    /**
     * @dev The function allows the allocation of "attributePoints" to the different characteristics.
     * @param _tokenId Id of the token.
     * @param _attack1 Attack number 1 of the token.
     * @param _attack2 Attack number 2 of the token.
     * @param _attack3 Attack number 3 of the token.
     * @param _attack4 Attack number 4 of the token.
     */
    function attributesLevelUp(uint256 _tokenId, uint24 _attack1, uint24 _attack2, uint24 _attack3, uint24 _attack4) external {
        uint256 totalPoints = _attack1 + _attack2 + _attack3 + _attack4;
        require(_characterDetails[_tokenId].attributePoints == totalPoints, "Wrong amount of points to attribute");
        // _characterDetails[_tokenId].hp += _hp * 20;
        // _characterDetails[_tokenId].stamina += _stamina * 20;
        _characterDetails[_tokenId].attack1 += _attack1;
        _characterDetails[_tokenId].attack2 += _attack2;
        _characterDetails[_tokenId].attack3 += _attack3;
        _characterDetails[_tokenId].attack4 += _attack4;
    }

    /**
     * @dev Fight algorithm: attack, defence and experience points are taken into account to determine a winner.
     * @param _id1 Id of the token number 1.
     * @param _id2 Id of the token number 2.
     */
    function _substrateLife(uint256 _id1, uint256 _id2) private view returns(uint256) {
        uint256 op1 = ((_characterDetails[_id1].attack1 + _characterDetails[_id1].attack2) / 2) * (1 + _characterDetails[_id1].xp);
        uint256 op2 = ((_characterDetails[_id2].attack3 + _characterDetails[_id2].attack4) / 2) * ((1 + _characterDetails[_id2].xp) / 2);
        if (op1 < op2) {
            return 0;
        } else {
            return op1 - op2;
        }
    }

    /**
     * @dev The Function manages the different scenarios during a fight.
     * @param _myTokenId Id of the token number 1.
     * @param _rivalTokenId Id of the token number 2.
     * @param _substrateLifeToRival Number of life points to remove from _rivalTokenId.
     * @param _substrateLifeToMe Number of life points to remove from _myTokenId.
     * Emits a "Fighted" event.
     */
    function _subtrateLifeOperation(uint256 _myTokenId, uint256 _rivalTokenId, uint256 _substrateLifeToRival, uint256 _substrateLifeToMe) private {
        if(_substrateLifeToRival >= _characterDetails[_rivalTokenId].hp) {
            _characterDetails[_rivalTokenId].hp = 0;
            _xpLevelUp(_myTokenId);
        } else {
            _characterDetails[_rivalTokenId].hp = _characterDetails[_rivalTokenId].hp - uint24(_substrateLifeToRival);
            if(_substrateLifeToMe >= _characterDetails[_myTokenId].hp) {
                _characterDetails[_myTokenId].hp = 0;
                _xpLevelUp(_rivalTokenId);
            } else {
                _characterDetails[_myTokenId].hp = _characterDetails[_myTokenId].hp - uint24(_substrateLifeToMe);
                if (_substrateLifeToRival > _substrateLifeToMe) {
                    _xpLevelUp(_myTokenId);
                } else if (_substrateLifeToMe > _substrateLifeToRival) {
                    _xpLevelUp(_rivalTokenId);
                } else {
                    _xpLevelUp(_myTokenId);
                    _xpLevelUp(_rivalTokenId);
                }
            }
        }
        emit Fighted(_myTokenId, _rivalTokenId, _substrateLifeToRival, _substrateLifeToMe);
    }

    /**
     * @dev The Function mint an NFT.
     * @param _typeCharacter Type of character between BRUTE, SPIRITUAL, ELEMENTARY.
     * @param _genderCharacter Gender of character between MASCULINE, FEMININE, OTHER.
     * Emits a "CharacterCreated" event.
     */
    function createCharacter(type_character _typeCharacter, gender_character _genderCharacter) external payable {
        require(msg.value == mintFee, "Wrong amount of fees");
        require(_balanceOfCharacters[msg.sender] < 5, "You can't have more than 5 NFT");
        require(countMints[uint8(_typeCharacter)] <= limitMint, "You cannot mint more character with this class");
        _generateRandomNumber(10**16);
        uint8[] memory _attributes = _attributesMintDistribution();
        _characterDetails[nextId] = Character(nextId, uint56(randomNumber), 1, 1, 100, 100, _attributes[0], _attributes[1], _attributes[2], _attributes[3], 0, block.timestamp, _typeCharacter, _genderCharacter);
        _balanceOfCharacters[msg.sender]++;
        countMints[uint8(_typeCharacter)]++;
        _mint(msg.sender, nextId, 1, "");
        emit CharacterCreated(nextId);
        nextId++;
    }

    /**
     * @dev The function allows the NFT to recover 100 health points and 100 stamina points.
     * @param _tokenId Id of the token.
     * Emits a "Rested" event.
     */
    // TODO: ajouter timestamp, faire les tests et ajouter l'explication au fichier tests_explication
    function rest(uint256 _tokenId) external {
        require(_ownerOf(_tokenId), "You're not the owner of the NFT");
        require(_characterDetails[_tokenId].stamina < 100 && _characterDetails[_tokenId].hp < 100, "You're character is already rested");
        // _characterDetails[_tokenId].lastRest = block.timestamp;
        _characterDetails[_tokenId].stamina = 100;
        _characterDetails[_tokenId].hp = 100;
        emit Rested(_tokenId);
    }

    /**
     * @dev The function allows you to use your NFT to fight with another NFT belonging to another user.
     * @param _myTokenId Id of the fighter number 1.
     * @param _rivalTokenId Id of the fighter number 2.
     */
    function fight(uint256 _myTokenId, uint256 _rivalTokenId) external {
        require(_ownerOf(_myTokenId), "You're not the owner of the NFT");
        require(_ownerOf(_myTokenId) != _ownerOf(_rivalTokenId), "Your NFTs cannot fight each other");
        require(_characterDetails[_myTokenId].lastFight + 60 < block.timestamp, "To soon to fight (1 min)");
        require(_characterDetails[_myTokenId].stamina >= 10, "Not enough stamina");
        require(_characterDetails[_myTokenId].level <= _characterDetails[_rivalTokenId].level, "Fight someone your own size!");
        require(_characterDetails[_myTokenId].hp > 0 && _characterDetails[_rivalTokenId].hp > 0, "One of the NFTs is dead");

        _characterDetails[_myTokenId].lastFight = block.timestamp;
        uint256 _substrateLifeToRival = _substrateLife(_myTokenId, _rivalTokenId);
        uint256 _substrateLifeToMe = _substrateLife(_rivalTokenId, _myTokenId);

        _characterDetails[_myTokenId].stamina = _characterDetails[_myTokenId].stamina - 10;
        _subtrateLifeOperation(_myTokenId, _rivalTokenId, _substrateLifeToRival, _substrateLifeToMe);
    }
    
    /**
     * @dev The function returns the characteristics of the NFT.
     * @param _tokenId Id of the token.
     */
    function getTokenDetails(uint256 _tokenId) external view returns(Character memory) {
        return _characterDetails[_tokenId];
    }

    /**
     * @dev The function returns an array with the characteristics of all my NFTs.
     */
    function getMyCharacters() external view returns (Character[] memory){
        uint8 count = 0;
        Character[] memory myCharacters = new Character[](_balanceOfCharacters[msg.sender]);
        for (uint256 i = 0; i < nextId; i++) {
            if (_ownerOf(i)) {
                myCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        return myCharacters;
    }

    /**
     * @dev The function returns an array with the characteristics of all the NFTs that don't belong to me.
     */
    function getOthersCharacters() external view returns (Character[] memory){
        uint256 count = 0;
        Character[] memory othersCharacters = new Character[](nextId - _balanceOfCharacters[msg.sender]);
        for (uint256 i = 0; i < nextId; i++) {
            if (!_ownerOf(i)) {
                othersCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        return othersCharacters;
    }
    
    // Only for TESTS
    function getBalanceOfCharacters(address _address) external view returns(uint8) {
        return _balanceOfCharacters[_address];
    }

    // function getAllCharacters() external view returns (Character[] memory){
    //     Character[] memory allCharacters = new Character[](nextId);
    //     for (uint256 i = 0; i < nextId; i++) {
    //         allCharacters[i] = _characterDetails[i];
    //     }
    //     return allCharacters;
    // }

    // function getCountMints(uint8 _class) external view returns(uint24) {
    //     return countMints[_class];
    // }
}