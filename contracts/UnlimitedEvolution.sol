// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./RandomNumberGenerator.sol";
import "./UnlimitedToken.sol";

/** @title Unlimited Evolution */
contract UnlimitedEvolution is ERC1155, ERC1155Holder, Ownable {

    /**
     * @dev Allows you to receive ERC1155 tokens and therefore make external calls to mint.
     * @param interfaceId Id of the interface.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155, ERC1155Receiver) returns(bool) {
        return super.supportsInterface(interfaceId);
    }

    uint8 constant BASIC_SWORD = 1;
    uint8 constant BASIC_SHIELD = 2;
    uint8 constant EXCALIBUR = 3;
    uint8 constant AEGIS = 4;
    uint8 constant POTION = 5;
    uint8 nextStuffId = 6;
    uint16 nextBruteId = 256;
    uint24 nextSpiritualId = 40256;
    uint24 nextElementaryId = 80256;
    uint24 limitMint = 4000;
    uint24[] countMints = new uint8[](3);
    uint256 mintFee = 0.001 ether;
    // Only for tests, to avoid chainlink
    bool public testMode;
    
    UnlimitedToken public unlimitedToken;
    RandomNumberGenerator public randomNumberGenerator;

    enum type_character { BRUTE, SPIRITUAL, ELEMENTARY }
    enum gender_character { MASCULINE, FEMININE, OTHER }
    enum type_stuff { WEAPON, SHIELD, POTION }

    struct Character {
        uint24 id;
        uint16 level;
        uint24 xp;
        uint24 hp;
        uint24 stamina;
        uint24 attack1;
        uint24 attack2;
        uint24 defence1;
        uint24 defence2;
        uint8 weapon;
        uint8 shield;
        uint16 rewards;
        uint256 lastRest;
        type_character typeCharacter;
        gender_character genderCharacter;
    }

    struct Stuff {
        uint8 id;
        uint8 bonusAttack1;
        uint8 bonusAttack2;
        uint8 bonusDefence1;
        uint8 bonusDefence2;
        uint256 mintPrice;
        type_stuff typeStuff;
    }

    // Mapping from token ID to token details
    mapping(uint24 => Character) private _characterDetails;

    // Mapping from token ID to token details
    mapping(uint8 => Stuff) private _stuffDetails;

    // Mapping from account to his number of NFTs
    mapping(address => uint8) private _balanceOfCharacters;

    /**
     * @dev Constructor of the contract ERC1155, mint stuff and add it to the mapping.
     * @param _unlimitedTokenAddress Address of the contract UnlimitedToken.
     * @param _randomNumberGenerator Address of the contract RandomNumberGenerator.
     */
    constructor(UnlimitedToken _unlimitedTokenAddress, RandomNumberGenerator _randomNumberGenerator) ERC1155("ipfs://QmbbLcmiZ3Qtu3kc2LQoR4d87tWPpbkiRuERpV2fN4HDTm/{id}.json") {
        unlimitedToken = _unlimitedTokenAddress;
        randomNumberGenerator = _randomNumberGenerator;
        _mint(address(this), BASIC_SWORD, 10**5, bytes(abi.encodePacked("Unlimited Evolution Stuff #", Strings.toString(BASIC_SWORD))));
        _stuffDetails[BASIC_SWORD] = Stuff(BASIC_SWORD, 2, 2, 0, 0, 0.001 ether, type_stuff.WEAPON);
        _mint(address(this), BASIC_SHIELD, 10**5, bytes(abi.encodePacked("Unlimited Evolution Stuff #", Strings.toString(BASIC_SHIELD))));
        _stuffDetails[BASIC_SHIELD] = Stuff(BASIC_SHIELD, 0, 0, 2, 2, 0.001 ether, type_stuff.SHIELD);
        _mint(address(this), EXCALIBUR, 1, bytes(abi.encodePacked("Unlimited Evolution Stuff #", Strings.toString(EXCALIBUR))));
        _stuffDetails[EXCALIBUR] = Stuff(EXCALIBUR, 10, 10, 10, 10, 0.1 ether, type_stuff.WEAPON);
        _mint(address(this), AEGIS, 1, bytes(abi.encodePacked("Unlimited Evolution Stuff #", Strings.toString(AEGIS))));
        _stuffDetails[AEGIS] = Stuff(AEGIS, 10, 10, 10, 10, 0.1 ether, type_stuff.SHIELD);
        _mint(address(this), POTION, 10**6, bytes(abi.encodePacked("Unlimited Evolution Potion #", Strings.toString(POTION))));
        _stuffDetails[POTION] = Stuff(POTION, 0, 0, 0, 0, 0.001 ether, type_stuff.POTION);
    }

    /**
     * @dev Emitted when the character with "id" is created.
     */
    event CharacterCreated(uint24 id);

    /**
     * @dev Emitted when the character with "id" is rested, he recovers health points and stamina.
     */
    event Rested(uint24 tokenId);

    /**
     * @dev Emitted when the character with "myTokenId" removes "substrateLifeToRival" points of hp to "rivalTokenId" and the character with "rivalTokenId" removes "substrateLifeToMe" points of hp to "myTokenId".
     */
    event Fighted(uint24 myTokenId, uint24 rivalTokenId, uint256 substrateLifeToRival, uint256 substrateLifeToMe);
    
    /**
     * @dev Emitted when the character with "tokenId" has gained enough experience points to increase one level.
     */
    event LevelUp(uint24 tokenId, uint16 level);

    /**
     * @dev Emitted when the owner changes the ether fee for minting, with the amount "mintFee".
     */
    event MintFeeUpdated(uint256 mintFee);

    /**
     * @dev Emitted when the owner changes the mintable NFT limit with the amount "limitMint".
     */
    event LimitUpdated(uint24 limitMint);

    /**
     * @dev Emitted when the msg.sender buy a stuff ".
     */
    event StuffBought(uint8 stuffId);

    /**
     * @dev Emitted when the msg.sender burn a potion.
     */
    event StuffEquiped(uint24 tokenId, uint8 stuffId);

    /**
     * @dev Emitted when the msg.sender burn a potion.
     */
    event PotionUsed(uint24 tokenId);

    /**
     * @dev Change the token's image URI
     * @param _tokenId Id of the token.
     */
    function uri(uint _tokenId) override public pure returns(string memory) {
        return string(abi.encodePacked(
            "ipfs://QmbbLcmiZ3Qtu3kc2LQoR4d87tWPpbkiRuERpV2fN4HDTm/",
            Strings.toString(_tokenId),
            ".json"
        ));
    }

    /**
     * @dev Return the name of the contract
     */
    function name() public pure returns(string memory) {
        return "Unlimited Evolution";
    }

    /**
     * @dev The function changes the ERC20 token address
     * @param _tokenAddress New token address.
     */
    function setTokenAddress(address _tokenAddress) external onlyOwner {
        unlimitedToken = UnlimitedToken(_tokenAddress);
    }

    /**
     * @dev The function changes the Chainlink Random Number Generator address
     * @param _randomAddress New token address.
     */
    function setLinkAddress(address _randomAddress) external onlyOwner {
        randomNumberGenerator = RandomNumberGenerator(_randomAddress);
    }
    
    /**
     * @dev The function changes the ether fee for minting.
     * @param _mintFee New amount of fee.
     * Emits a "MintFeeUpdated" event.
     */
    function updateMintFee(uint256 _mintFee) external onlyOwner {
        mintFee = _mintFee;
        emit MintFeeUpdated(mintFee);
    }

    /**
     * @dev The function changes the mintable NFT limit.
     * @param _limitMint New limit of mintable NFT.
     * Emits a "LimitUpdated" event.
     */
    function updateLimitMint(uint24 _limitMint) external onlyOwner {
        limitMint = _limitMint;
        emit LimitUpdated(limitMint);
    }
    
    /**
     * @dev Owner withdraws the entire amount of MATIC.
     */
    function withdrawMatic() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    /**
     * @dev Owner withdraws an amount of LINK.
     * @param value Amount of LINK.
     */
    function withdrawLink(uint256 value) external onlyOwner {
        randomNumberGenerator.withdraw(value);
    }

    /**
     * @dev Tip to simulate the function ownerOf of ERC721, check if msg.sender is owner of the token.
     * @param _tokenId Id of the token.
     * @return Boolean, true of false.
     */
    function _ownerOf(uint256 _tokenId) private view returns(bool) {
        return balanceOf(msg.sender, _tokenId) != 0;
    }

    // /**
    //  * @dev Allows you to create a new Stuff.
    //  * Warning: Prefer to use createStuff() rather than manageStuff(), more secure with nextStuffId.
    //  * @param amount Amount of NFT mintable.
    //  * @param bonusAttack1 Bonus value attack1.
    //  * @param bonusAttack2 Bonus value attack2.
    //  * @param bonusDefence1 Bonus value defence1.
    //  * @param bonusDefence2 Bonus value defence2.
    //  * @param typeStuff Type of the stuff.
    //  */
    // function createStuff(uint256 amount, uint8 bonusAttack1, uint8 bonusAttack2, uint8 bonusDefence1, uint8 bonusDefence2, uint256 price, type_stuff typeStuff) external onlyOwner {
    //     require(nextStuffId < 256, "The NFT Stuff limit is reached");
    //     _mint(address(this), nextStuffId, amount, "");
    //     _stuffDetails[nextStuffId] = Stuff(nextStuffId, bonusAttack1, bonusAttack2, bonusDefence1, bonusDefence2, price, typeStuff);
    //     nextStuffId++;
    // }

    /**
     * @dev Allows you to create a new Stuff/Consumable and to modify the quantity, statistics and type of an existing NFT Stuff.
     * Warning: Be extremely careful with this function ! If you want to create a new NFT Stuff, prefer to use createStuff() !
     * @param stuffId Id of the stuff.
     * @param amount Amount of NFT mintable.
     * @param bonusAttack1 Bonus value attack1.
     * @param bonusAttack2 Bonus value attack2.
     * @param bonusDefence1 Bonus value defence1.
     * @param bonusDefence2 Bonus value defence2.
     * @param typeStuff Type of the stuff.
     */
    function manageStuff(uint8 stuffId, uint256 amount, uint8 bonusAttack1, uint8 bonusAttack2, uint8 bonusDefence1, uint8 bonusDefence2, uint256 price, type_stuff typeStuff) external onlyOwner {
        _mint(address(this), stuffId, amount, "");
        if (stuffId != 5) {
            _stuffDetails[stuffId] = Stuff(stuffId, bonusAttack1, bonusAttack2, bonusDefence1, bonusDefence2, price, typeStuff);
        }
    }

    /**
     * @dev The function assigns a number between 3 and 5 randomly to the attack characteristics using "randomNumber".
     * @param randomNumber Random number from chainlink.
     * @return Array of number (attributes).
     */
    function _attributesMintDistribution(uint256 randomNumber) private pure returns(uint8[] memory) {
        uint8[] memory _attributes = new uint8[](4);
        for(uint8 i=0; i<4; i++) {
            _attributes[i] = 3 + uint8((randomNumber % (10+i)) % 3);
        }
        return _attributes;
    }

    /**
     * @dev The Function ask to Chainlink a random number before to mint an NFT.
     * @param _typeCharacter Type of character between BRUTE, SPIRITUAL, ELEMENTARY.
     * @param _genderCharacter Gender of character between MASCULINE, FEMININE, OTHER.
     */
    function askCreateCharacter(type_character _typeCharacter, gender_character _genderCharacter) external payable {
        require(msg.value == mintFee, "Wrong amount of fees");
        require(_balanceOfCharacters[msg.sender] < 5, "You can't have more than 5 NFT");
        require(countMints[uint8(_typeCharacter)] <= limitMint, "You cannot mint more character with this class");
        if (!testMode) { // Only for tests, to avoid chainlink
            randomNumberGenerator.getRandomNumberMint(_typeCharacter, _genderCharacter, msg.sender);
        } else {
            this.createCharacter(_typeCharacter, _genderCharacter, uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 10**16, msg.sender);
        }
    }

    /**
     * @dev The Function mint an NFT.
     * @param _typeCharacter Type of character between BRUTE, SPIRITUAL, ELEMENTARY.
     * @param _genderCharacter Gender of character between MASCULINE, FEMININE, OTHER.
     * @param randomNumber Random number from chainlink.
     * @param _address Address of the requestor (necessary for chainlink).
     * Emits a "CharacterCreated" event.
     */
    function createCharacter(type_character _typeCharacter, gender_character _genderCharacter, uint256 randomNumber, address _address) external {
        require(msg.sender == address(randomNumberGenerator) || msg.sender == address(this), "Not allowed to use this function");
        uint8[] memory _attributes = _attributesMintDistribution(randomNumber);
        uint24 nextCharacterId;
        if(_typeCharacter == type_character.BRUTE) {
            nextCharacterId = nextBruteId;
        } else if (_typeCharacter == type_character.SPIRITUAL) {
            nextCharacterId = nextSpiritualId;
        } else {
            nextCharacterId = nextElementaryId;
        }
        
        _characterDetails[nextCharacterId] = Character(nextCharacterId, 1, 1, 100, 100, _attributes[0], _attributes[1], _attributes[2], _attributes[3], 0, 0, 0, 0, _typeCharacter, _genderCharacter);
        _balanceOfCharacters[_address]++;
        countMints[uint8(_typeCharacter)]++;
        _mint(_address, nextCharacterId, 1, bytes(abi.encodePacked("Unlimited Evolution Character #", Strings.toString(nextCharacterId))));
        emit CharacterCreated(nextCharacterId);

        if(_typeCharacter == type_character.BRUTE) {
            nextBruteId++;
        } else if (_typeCharacter == type_character.SPIRITUAL) {
            nextSpiritualId++;
        } else {
            nextElementaryId++;
        }
    }

    /**
     * @dev The function allows the NFT to recover 100 health points and 100 stamina points.
     * @param _tokenId Id of the token.
     * Emits a "Rested" event.
     */
    function rest(uint24 _tokenId) external {
        require(_ownerOf(_tokenId), "You don't own this NFT");
        require(_characterDetails[_tokenId].stamina < 100 || _characterDetails[_tokenId].hp < 100, "You're character is already rested");
        _characterDetails[_tokenId].lastRest = block.timestamp;
        _characterDetails[_tokenId].stamina = 100;
        _characterDetails[_tokenId].hp = 100;
        emit Rested(_tokenId);
    }

    /**
     * @dev One experience point is added and if the experience number reaches % 10 == 0 then the NFT increases one level and gains 1 point of reward.
     * @param _tokenId Id of the token.
     * Emits a "LevelUp" event.
     */
    function _xpLevelUp(uint24 _tokenId) private {
        _characterDetails[_tokenId].xp++;
        if (_characterDetails[_tokenId].xp % 10 == 0) {
            _characterDetails[_tokenId].level++;
            _characterDetails[_tokenId].rewards++;
            emit LevelUp(_tokenId, _characterDetails[_tokenId].level);
        }
    }

    // /**
    //  * @dev The function allows the allocation of attribute points (rewards*10) to the different characteristics.
    //  * @param _tokenId Id of the token.
    //  * @param _attack1 Attack number 1 of the token.
    //  * @param _attack2 Attack number 2 of the token.
    //  * @param _defence1 Defence number 1 of the token.
    //  * @param _defence2 Defence number 2 of the token.
    //  */
    // function attributesLevelUp(uint24 _tokenId, uint16 _attack1, uint16 _attack2, uint16 _defence1, uint16 _defence2) external {
    //     require(_characterDetails[_tokenId].rewards * 10 == _attack1 + _attack2 + _defence1 + _defence2, "Wrong amount of points to attribute");
    //     _characterDetails[_tokenId].rewards = 0;
    //     _characterDetails[_tokenId].attack1 += _attack1;
    //     _characterDetails[_tokenId].attack2 += _attack2;
    //     _characterDetails[_tokenId].defence1 += _defence1;
    //     _characterDetails[_tokenId].defence2 += _defence2;
    // }

    /**
     * @dev Claim Rewards after LevelUp, gains potion and ULT.
     * @param _tokenId Id of the token.
     */
    function claimRewards(uint24 _tokenId) external {
        require(_ownerOf(_tokenId), "You don't own this NFT");
        require(_characterDetails[_tokenId].rewards > 0, "You don't have any reward");
        uint16 rewards = _characterDetails[_tokenId].rewards;
        _characterDetails[_tokenId].rewards = 0;
        unlimitedToken.levelUpMint(msg.sender, rewards);
        safeTransferFrom(address(this), msg.sender, POTION, rewards, "");
    }

    /**
     * @dev Fight algorithm: attack, defence and experience points are taken into account to determine a winner.
     * @param _id1 Id of the token number 1.
     * @param _id2 Id of the token number 2.
     * @return Number resulting from fight operations.
     */
    function _substrateLife(uint24 _id1, uint24 _id2, uint256 randomNumber) private view returns(uint16) {
        uint16 op1 = uint16(((_characterDetails[_id1].attack1 + _characterDetails[_id1].attack2 + _characterDetails[_id1].xp) / 2) * (1 + randomNumber));
        uint16 op2 = uint16((_characterDetails[_id2].defence1 + _characterDetails[_id2].defence2) / 2);
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
    function _subtrateLifeOperation(uint24 _myTokenId, uint24 _rivalTokenId, uint16 _substrateLifeToRival, uint16 _substrateLifeToMe) private {
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
     * @dev The Function ask to Chainlink a random number before to fight.
     * @param _myTokenId Id of the fighter number 1.
     * @param _rivalTokenId Id of the fighter number 2.
     */
    function askFight(uint24 _myTokenId, uint24 _rivalTokenId) external {
        require(_ownerOf(_myTokenId), "You don't own this NFT");
        require(_ownerOf(_myTokenId) != _ownerOf(_rivalTokenId), "Your NFTs cannot fight each other");
        require(_characterDetails[_myTokenId].lastRest + 86400 < block.timestamp, "You're character is resting");
        require(_characterDetails[_rivalTokenId].lastRest + 86400 < block.timestamp, "You're rival is resting");
        require(_characterDetails[_myTokenId].stamina >= 10, "Not enough stamina");
        require(_characterDetails[_myTokenId].level <= _characterDetails[_rivalTokenId].level, "Fight someone your own size!");
        require(_characterDetails[_myTokenId].hp > 0 && _characterDetails[_rivalTokenId].hp > 0, "One of the NFTs is dead");
        if (!testMode) { // Only for tests, to avoid chainlink
            randomNumberGenerator.getRandomNumberFight(_myTokenId, _rivalTokenId);
        } else {
            this.fight(_myTokenId, _rivalTokenId, uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % 3);
        }  
    }

    /**
     * @dev The function allows you to use your NFT to fight with another NFT belonging to another user.
     * @param _myTokenId Id of the fighter number 1.
     * @param _rivalTokenId Id of the fighter number 2.
     * @param randomNumber Random number from chainlink.
     */
    function fight(uint24 _myTokenId, uint24 _rivalTokenId, uint256 randomNumber) external {
        require(msg.sender == address(randomNumberGenerator) || msg.sender == address(this), "Not allowed to use this function");
        uint16 _substrateLifeToRival = _substrateLife(_myTokenId, _rivalTokenId, randomNumber);
        uint16 _substrateLifeToMe = _substrateLife(_rivalTokenId, _myTokenId, 0);
        _characterDetails[_myTokenId].stamina = _characterDetails[_myTokenId].stamina - 10;
        _subtrateLifeOperation(_myTokenId, _rivalTokenId, _substrateLifeToRival, _substrateLifeToMe);
    }

    /**
     * @dev The function allows you to buy a stuff NFT
     * @param stuffId Id of the stuff.
     * Emits a "StuffBought" event.
     */
    function buyStuff(uint8 stuffId) external payable {
        require(stuffId != 0, "Non-existent stuff");
        require(balanceOf(address(this), stuffId) != 0, "Stuff no more available");
        require(msg.value == _stuffDetails[stuffId].mintPrice, "Wrong amount of fees");
        this.safeTransferFrom(address(this), msg.sender, stuffId, 1, "");
        emit StuffBought(stuffId);
    }

    /**
     * @dev The function allows you to equip stuff to your NFT
     * @param tokenId Id of the token.
     * @param stuffId Id of the stuff to equip.
     * Emits a "StuffEquiped" event.
     */
    function equipStuff(uint24 tokenId, uint8 stuffId) external {
        require(tokenId > 255, "Wrong kind of NFT (Stuff)");
        require(_ownerOf(tokenId), "You don't own this NFT");
        require(stuffId != POTION, "You can't equip a potion");
        require(_ownerOf(stuffId), "You don't own this stuff");
        type_stuff stuffType = _stuffDetails[stuffId].typeStuff;
        uint8 idStuffEquiped;
        if (stuffType == type_stuff.WEAPON) {
            idStuffEquiped = _characterDetails[tokenId].weapon;
        } else {
            idStuffEquiped = _characterDetails[tokenId].shield;
        }
        if (idStuffEquiped != 0) {
            _characterDetails[tokenId].attack1 -= _stuffDetails[idStuffEquiped].bonusAttack1;
            _characterDetails[tokenId].attack2 -= _stuffDetails[idStuffEquiped].bonusAttack2;
            _characterDetails[tokenId].defence1 -= _stuffDetails[idStuffEquiped].bonusDefence1;
            _characterDetails[tokenId].defence2 -= _stuffDetails[idStuffEquiped].bonusDefence2;
        }
        _characterDetails[tokenId].attack1 += _stuffDetails[stuffId].bonusAttack1;
        _characterDetails[tokenId].attack2 += _stuffDetails[stuffId].bonusAttack2;
        _characterDetails[tokenId].defence1 += _stuffDetails[stuffId].bonusDefence1;
        _characterDetails[tokenId].defence2 += _stuffDetails[stuffId].bonusDefence2;
        if (stuffType == type_stuff.WEAPON) {
            _characterDetails[tokenId].weapon = stuffId;
        } else {
            _characterDetails[tokenId].shield = stuffId;
        }
        emit StuffEquiped(tokenId, stuffId);
    }

    /**
     * @dev The function burn a POTION and restore the hp and stamina of your NFT
     * @param tokenId Id of the token.
     * Emits a "PotionUsed" event.
     */
    function usePotion(uint24 tokenId) external {
        require(tokenId > 255, "Wrong kind of NFT (Stuff)");
        require(_ownerOf(tokenId), "You don't own this NFT");
        require(_ownerOf(POTION), "You don't own a potion");
        require(_characterDetails[tokenId].stamina < 100 || _characterDetails[tokenId].hp < 100, "You're character is already rested");
        _burn(msg.sender, POTION, 1);
        _characterDetails[tokenId].stamina = 100;
        _characterDetails[tokenId].hp = 100;
        emit PotionUsed(tokenId);
    }

    /**
     * @dev The function returns the characteristics of the NFT.
     * @param tokenId Id of the token.
     * @return Character Details of tokenId.
     */
    function getTokenDetails(uint24 tokenId) external view returns(Character memory) {
        return _characterDetails[tokenId];
    }

    /**
     * @dev The function returns the characteristics of the stuff.
     * @param stuffId Id of the stuff.
     * @return Stuff Details of stuffId.
     */
    function getStuffDetails(uint8 stuffId) external view returns(Stuff memory) {
        return _stuffDetails[stuffId];
    }

    /**
     * @dev The function returns an array with the characteristics of all my NFTs.
     * @return Array of characters.
     */
    function getMyCharacters() external view returns(Character[] memory){
        uint8 count;
        Character[] memory myCharacters = new Character[](_balanceOfCharacters[msg.sender]);
        for (uint16 i = 256; i < nextBruteId; i++) {
            if (_ownerOf(i)) {
                myCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        for (uint24 i = 40256; i < nextSpiritualId; i++) {
            if (_ownerOf(i)) {
                myCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        for (uint24 i = 80256; i < nextElementaryId; i++) {
            if (_ownerOf(i)) {
                myCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        return myCharacters;
    }

    /**
     * @dev The function returns an array with the characteristics of all the NFTs that don't belong to me.
     * @return Array of characters.
     */
    function getOthersCharacters() external view returns(Character[] memory){
        uint24 count;
        Character[] memory othersCharacters = new Character[]((nextBruteId - 256) + ((nextSpiritualId - 40256)) + (nextElementaryId - 80256) - _balanceOfCharacters[msg.sender]);
        for (uint16 i = 256; i < nextBruteId; i++) {
            if (!_ownerOf(i)) {
                othersCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        for (uint24 i = 40256; i < nextSpiritualId; i++) {
            if (!_ownerOf(i)) {
                othersCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        for (uint24 i = 80256; i < nextElementaryId; i++) {
            if (!_ownerOf(i)) {
                othersCharacters[count] = _characterDetails[i];
                count++;
            }
        }
        return othersCharacters;
    }

    /**
     * @dev The function returns an array with the characteristics of all my Stuffs.
     * @return Array of stuffs.
     */
    function getMyStuffs() external view returns(Stuff[] memory){
        uint8 arrayCount;
        for (uint8 i; i < nextStuffId; i++) {
            if (i !=5 && _ownerOf(i)) {
                arrayCount++;
            }
        }
        Stuff[] memory myStuffs = new Stuff[](arrayCount);
        uint8 count;
        for (uint8 i; i < nextStuffId-1; i++) {
            if (i !=5 && _ownerOf(i)) {
                myStuffs[count] = _stuffDetails[i];
                count++;
            }
        }
        return myStuffs;
    }
    
    // Only for tests, to avoid chainlink
    function testModeSwitch() external onlyOwner {
        testMode = !testMode;
    }
}
