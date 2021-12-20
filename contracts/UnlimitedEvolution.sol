// SPDX-License-Identifier: MIT
pragma solidity 0.8.11;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract UnlimitedEvolution is ERC1155, Ownable {

    constructor() ERC1155("") {}

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    using SafeMath for uint256;

    enum type_character { BRUTE, SPIRITUAL, ELEMENTARY }
    uint256 nextId;
    uint256 mintFee = 0.001 ether;
    uint256 healFee = 0.00001 ether;
    uint256 fightFee = 0.00001 ether;

    struct Character {
        uint256 id;
        uint256 dna;
        uint256 level;
        uint256 xp;
        uint256 hp;
        uint256 mana;
        uint256 attack;
        uint256 armor;
        uint256 magicAttack;
        uint256 magicResistance;
        uint256 lastFight;
        uint256 lastHeal;
        type_character typeCharacter;
    }

    mapping(uint256 => Character) private _characterDetails;
    mapping(address => uint8) private _balanceOfCharacters;

    // events
    event CharacterCreated(uint256 id);
    event Healed(uint256 tokenId);
    event Fighted(uint256 myTokenId, uint256 rivalTokenId, uint256 substrateLifeToRival, uint256 substrateLifeToMe);
    event LevelUp(uint256 tokenId, uint256 level);
    event FeesUpdated(uint256 _mintFee, uint256 _healFee, uint256 _fightFee);

    // Helper
    function _generateRandomNum(uint256 _mod) private view returns(uint256) {
        uint256 randNum = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        return randNum.mod(_mod);
    }

    function _ownerOf(uint256 tokenId) private view returns (bool) {
        return balanceOf(msg.sender, tokenId) != 0;
    }
    
    function updateFees(uint256 _mintFee, uint256 _healFee, uint256 _fightFee) external onlyOwner() {
        mintFee = _mintFee;
        healFee = _healFee;
        fightFee = _fightFee;
        emit FeesUpdated(mintFee, healFee, fightFee);
    }
    
    function withdraw() external onlyOwner() {
        payable(owner()).transfer(address(this).balance);
    }
    
    function substrateLife(uint256 id1, uint256 id2) private view returns(uint256) {
        uint256 op1 = (_characterDetails[id1].attack).mul((1 + _characterDetails[id1].xp));
        uint256 op2 = (_characterDetails[id2].armor).mul(((1 + _characterDetails[id2].xp).div(2)));
        if (op1 < op2) {
            return 0;
        } else {
            return op1.sub(op2);
        }
    }

    function substrateLifeMagic(uint256 id1, uint256 id2) private view returns(uint256) {
        uint256 op1 = (_characterDetails[id1].magicAttack).mul((1 + _characterDetails[id1].xp));
        uint256 op2 = (_characterDetails[id2].magicResistance).mul(((1 + _characterDetails[id2].xp).div(2)));
        if (op1 < op2) {
            return 0;
        } else {
            return op1.sub(op2);
        }
    }

    function XpLevelUp(uint256 _tokenId) private {
        _characterDetails[_tokenId].xp++;
        if (_characterDetails[_tokenId].xp % 10 == 0) {
            _characterDetails[_tokenId].level++;
            emit LevelUp(_tokenId, _characterDetails[_tokenId].level);
        }
    }

    function sustrateLifeOperation(uint256 _myTokenId, uint256 _rivalTokenId, uint256 substrateLifeToRival, uint256 substrateLifeToMe) private {
        if(substrateLifeToRival >= _characterDetails[_rivalTokenId].hp) {
            _characterDetails[_rivalTokenId].hp = 0;
            XpLevelUp(_myTokenId);
        } else {
            _characterDetails[_rivalTokenId].hp = (_characterDetails[_rivalTokenId].hp).sub(substrateLifeToRival);
            if(substrateLifeToMe >= _characterDetails[_myTokenId].hp) {
                _characterDetails[_myTokenId].hp = 0;
                XpLevelUp(_rivalTokenId);
            } else {
                _characterDetails[_myTokenId].hp = (_characterDetails[_myTokenId].hp).sub(substrateLifeToMe);
                if (substrateLifeToRival > substrateLifeToMe) {
                    XpLevelUp(_myTokenId);
                } else if (substrateLifeToMe > substrateLifeToRival) {
                    XpLevelUp(_rivalTokenId);
                } else {
                    XpLevelUp(_myTokenId);
                    XpLevelUp(_rivalTokenId);
                }
            }
        }
        emit Fighted(_myTokenId, _rivalTokenId, substrateLifeToRival, substrateLifeToMe);
    }

    function createCharacter(type_character _typeCharacter) external payable {
        require(msg.value == mintFee, "Wrong amount of fees");
        require(_balanceOfCharacters[msg.sender] < 5, "You can't have more than 5 NFT");
        uint256 dna = _generateRandomNum(10**16);
        if (_typeCharacter == type_character.BRUTE) {
            _characterDetails[nextId] = Character(nextId, dna, 1, 1, 100, 10, 5, 3, 1, 1, block.timestamp, block.timestamp, type_character.BRUTE);
        }
        if (_typeCharacter == type_character.SPIRITUAL) {
            _characterDetails[nextId] = Character(nextId, dna, 1, 1, 100, 100, 1, 1, 5, 3, block.timestamp, block.timestamp, type_character.SPIRITUAL);
        }
        if (_typeCharacter == type_character.ELEMENTARY) {
            _characterDetails[nextId] = Character(nextId, dna, 1, 1, 100, 50, 2, 2, 3, 3, block.timestamp, block.timestamp, type_character.ELEMENTARY);
        }
        _balanceOfCharacters[msg.sender]++;
        _mint(msg.sender, nextId, 1, "");
        emit CharacterCreated(nextId);
        nextId++;
    }

    function heal(uint256 _tokenId) external payable {
        require(msg.value == healFee, "Wrong amount of fees");
        require(_ownerOf(_tokenId), "You're not the owner of the NFT");
        require(_characterDetails[_tokenId].lastHeal + 60 < block.timestamp, "To soon to heal (1 min)");
        require(_characterDetails[_tokenId].hp < 100, "You're character is already healed");
        // require(_characterDetails[_tokenId].hp > 0, "You're NFT is dead");
        _characterDetails[_tokenId].lastHeal = block.timestamp;
        uint256 tempResult = (_characterDetails[_tokenId].hp).add(50);
        if (tempResult > 100) {
            _characterDetails[_tokenId].hp = 100;
        } else {
            _characterDetails[_tokenId].hp = (_characterDetails[_tokenId].hp).add(50);
        }
        emit Healed(_tokenId);
    }

    function fight(uint256 _myTokenId, uint256 _rivalTokenId) external payable {
        require(msg.value == fightFee, "Wrong amount of fees");
        require(_ownerOf(_myTokenId), "You're not the owner of the NFT");
        require(_ownerOf(_myTokenId) != _ownerOf(_rivalTokenId), "Your NFTs cannot fight each other");
        require(_characterDetails[_myTokenId].lastFight + 60 < block.timestamp, "To soon to fight (1 min)");
        require(_characterDetails[_myTokenId].level <= _characterDetails[_rivalTokenId].level, "Fight someone your own size!");
        require(_characterDetails[_myTokenId].hp > 0 && _characterDetails[_rivalTokenId].hp > 0, "One of the NFTs is dead");

        _characterDetails[_myTokenId].lastFight = block.timestamp;
        uint256 substrateLifeToRival = substrateLife(_myTokenId, _rivalTokenId);
        uint256 substrateLifeToMe = substrateLife(_rivalTokenId, _myTokenId);

        sustrateLifeOperation(_myTokenId, _rivalTokenId, substrateLifeToRival, substrateLifeToMe);
    }

    function spell(uint256 _myTokenId, uint256 _rivalTokenId) external payable {
        require(msg.value == fightFee, "Wrong amount of fees");
        require(_ownerOf(_myTokenId), "You're not the owner of the NFT");
        require(_ownerOf(_myTokenId) != _ownerOf(_rivalTokenId), "Your NFTs cannot fight each other");
        require(_characterDetails[_myTokenId].lastFight + 60 < block.timestamp, "To soon to fight (1 min)");
        require(_characterDetails[_myTokenId].mana >= 10, "You don't have enough mana");
        require(_characterDetails[_myTokenId].level <= _characterDetails[_rivalTokenId].level, "Fight someone your own size!");
        require(_characterDetails[_myTokenId].hp > 0 && _characterDetails[_rivalTokenId].hp > 0, "One of the NFTs is dead");

        _characterDetails[_myTokenId].lastFight = block.timestamp;
        uint256 substrateLifeToRival = substrateLifeMagic(_myTokenId, _rivalTokenId);
        uint256 substrateLifeToMe = substrateLifeMagic(_rivalTokenId, _myTokenId);

        _characterDetails[_myTokenId].mana = (_characterDetails[_myTokenId].mana).sub(10);
        sustrateLifeOperation(_myTokenId, _rivalTokenId, substrateLifeToRival, substrateLifeToMe);
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
        Character[] memory othersCharacters = new Character[](nextId.sub(_balanceOfCharacters[msg.sender]));
        for (uint256 i = 0; i < nextId; i++) {
            if (_ownerOf(i)) {
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
}
