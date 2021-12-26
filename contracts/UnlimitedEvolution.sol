// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UnlimitedEvolution is ERC1155, Ownable {

    constructor() ERC1155("") {}

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    enum type_character { BRUTE, SPIRITUAL, ELEMENTARY }
    enum gender_character { MASCULINE, FEMININE, OTHER }
    uint256 mintFee = 0.001 ether;
    uint24 nextId;
    uint24 limitMint = 4000;
    uint24[] countMints = new uint8[](3);

    struct Character {
        uint24 id;
        uint56 dna;
        uint16 level;
        uint24 xp;
        uint24 hp;
        uint24 stamina;
        uint24 attack;
        uint24 armor;
        uint24 attack1;
        uint24 attack2;
        uint24 attack3;
        uint24 attack4;
        uint24 attributePoints;
        uint256 lastFight;
        type_character typeCharacter;
        gender_character genderCharacter;
    }

    mapping(uint256 => Character) private _characterDetails;
    mapping(address => uint8) private _balanceOfCharacters;

    // Events
    event CharacterCreated(uint256 id);
    // event Healed(uint256 tokenId);
    event Rested(uint256 tokenId);
    event Fighted(uint256 myTokenId, uint256 rivalTokenId, uint256 substrateLifeToRival, uint256 substrateLifeToMe);
    event LevelUp(uint256 tokenId, uint256 level);
    event FeeUpdated(uint256 mintFee);
    event LimitUpdated(uint256 limitMint);
    
    function updateFee(uint256 _mintFee) external onlyOwner() {
        mintFee = _mintFee;
        emit FeeUpdated(mintFee);
    }

    function updateLimitMint(uint24 _limitMint) external onlyOwner() {
        limitMint = _limitMint;
        emit LimitUpdated(limitMint);
    }
    
    function withdraw() external onlyOwner() {
        payable(owner()).transfer(address(this).balance);
    }

    function _ownerOf(uint256 tokenId) private view returns (bool) {
        return balanceOf(msg.sender, tokenId) != 0;
    }

    // to change with an oracle
    function _generateRandomNumber(uint256 _mod, uint8 num) private view returns(uint256) {
        return uint256(keccak256(abi.encodePacked(num, block.timestamp, block.difficulty, msg.sender))) % _mod;
    }

    function _attributesMintDistribution() private view returns(uint8[] memory) {
        uint8[] memory _attributes = new uint8[](4);
        for(uint8 i=0; i<4; i++) {
            _attributes[i] = 3 + uint8(_generateRandomNumber(3, i)); // idée nft: la lose ou la win, tu obtiens 0 ou 10 points bonus
        }
        return _attributes;
    }
    
    function _substrateLife(uint256 id1, uint256 id2) private view returns(uint256) {
        uint256 op1 = _characterDetails[id1].attack * (1 + _characterDetails[id1].xp);
        uint256 op2 = _characterDetails[id2].armor * ((1 + _characterDetails[id2].xp) / 2);
        if (op1 < op2) {
            return 0;
        } else {
            return op1 - op2;
        }
    }

    function _xpLevelUp(uint256 _tokenId) private {
        _characterDetails[_tokenId].xp++;
        if (_characterDetails[_tokenId].xp % 10 == 0) {
            _characterDetails[_tokenId].level++;
            _characterDetails[_tokenId].attributePoints += 10;
            emit LevelUp(_tokenId, _characterDetails[_tokenId].level);
        }
    }

    function attributesLevelUp(uint256 _tokenId, uint24 _hp, uint24 _stamina, uint24 _attack, uint24 _armor, uint24 _attack1, uint24 _attack2, uint24 _attack3, uint24 _attack4) external {
        uint256 totalPoints = _hp + _stamina + _attack + _armor + _attack1 + _attack2 + _attack3 + _attack4;
        require(_characterDetails[_tokenId].attributePoints == totalPoints, "Wrong amount of points to attribute");
        _characterDetails[_tokenId].hp += _hp * 20;
        _characterDetails[_tokenId].stamina += _stamina * 20;
        _characterDetails[_tokenId].attack += _attack;
        _characterDetails[_tokenId].armor += _armor;
        _characterDetails[_tokenId].attack1 += _attack1;
        _characterDetails[_tokenId].attack2 += _attack2;
        _characterDetails[_tokenId].attack3 += _attack3;
        _characterDetails[_tokenId].attack4 += _attack4;
    }

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

    function createCharacter(type_character _typeCharacter, gender_character _genderCharacter) external payable {
        require(msg.value == mintFee, "Wrong amount of fees");
        require(_balanceOfCharacters[msg.sender] < 5, "You can't have more than 5 NFT");
        require(countMints[uint8(_typeCharacter)] <= limitMint, "You cannot mint more character with this class");
        uint8[] memory _attributes = _attributesMintDistribution();
        _characterDetails[nextId] = Character(nextId, uint56(_generateRandomNumber(10**16, 1)), 1, 1, 100, 100, 5, 3, _attributes[0], _attributes[1], _attributes[2], _attributes[3], 10, block.timestamp, _typeCharacter, _genderCharacter);
        _balanceOfCharacters[msg.sender]++;
        countMints[uint8(_typeCharacter)]++;
        _mint(msg.sender, nextId, 1, "");
        emit CharacterCreated(nextId);
        nextId++;
    }

    // function heal(uint256 _tokenId) external {
    //     require(_ownerOf(_tokenId), "You're not the owner of the NFT");
    //     require(_characterDetails[_tokenId].lastHeal + 60 < block.timestamp, "To soon to heal (1 min)");
    //     require(_characterDetails[_tokenId].hp < 100, "You're character is already healed");
    //     _characterDetails[_tokenId].lastHeal = block.timestamp;
    //     uint256 tempResult = (_characterDetails[_tokenId].hp).add(50);
    //     if (tempResult > 100) {
    //         _characterDetails[_tokenId].hp = 100;
    //     } else {
    //         _characterDetails[_tokenId].hp = (_characterDetails[_tokenId].hp).add(50);
    //     }
    //     emit Healed(_tokenId);
    // }

    function rest(uint256 _tokenId) external {
        require(_ownerOf(_tokenId), "You're not the owner of the NFT");
        require(_characterDetails[_tokenId].stamina < 100, "You're character is already rested");
        _characterDetails[_tokenId].stamina = 100;
        emit Rested(_tokenId);
    }

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
    
    // Getters
    function getTokenDetails(uint256 _tokenId) external view returns(Character memory) {
        return _characterDetails[_tokenId];
    }

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
    
    // // only for TESTS getAllCharacters
    // function getAllCharacters() external view returns (Character[] memory){
    //     Character[] memory allCharacters = new Character[](nextId);
    //     for (uint256 i = 0; i < nextId; i++) {
    //         allCharacters[i] = _characterDetails[i];
    //     }
    //     return allCharacters;
    // }
    function getBalanceOfCharacters(address _address) external view returns(uint8) {
        return _balanceOfCharacters[_address];
    }

    function getCountMints(uint8 _class) external view returns(uint24) {
        return countMints[_class];
    }
}