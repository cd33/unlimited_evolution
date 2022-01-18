// // SPDX-License-Identifier: MIT
// pragma solidity 0.8.7;

// import "@openzeppelin/contracts/access/Ownable.sol";
// import "./UnlimitedToken.sol";
// import "./UnlimitedEvolution.sol";

// /** @title Unlimited Evolution Fight */
// contract UnlimitedFight is UnlimitedEvolution, Ownable {

//     UnlimitedToken public unlimitedToken;

//     /**
//      * @dev Emitted when the character with "myTokenId" removes "substrateLifeToRival" points of hp to "rivalTokenId" and the character with "rivalTokenId" removes "substrateLifeToMe" points of hp to "myTokenId".
//      */
//     event Fighted(uint24 myTokenId, uint24 rivalTokenId, uint256 substrateLifeToRival, uint256 substrateLifeToMe);
    
//     /**
//      * @dev Emitted when the character with "tokenId" has gained enough experience points to increase one level.
//      */
//     event LevelUp(uint24 tokenId, uint16 level);

//     /**
//      * @dev One experience point is added and if the experience number reaches % 10 == 0 then the NFT increases one level and gains 10 points to attribute to his stats.
//      * @param _tokenId Id of the token.
//      * Emits a "LevelUp" event.
//      */
//     function _xpLevelUp(uint24 _tokenId) private {
//         UnlimitedEvolution.Character memory _characterDetails = unlimitedEvolution.getTokenDetails(_tokenId);
//         _characterDetails.xp++;
//         if (_characterDetails.xp % 10 == 0) {
//             _characterDetails.level++;
//             _characterDetails.attributePoints += 10;
//             unlimitedToken.levelUpMint(msg.sender, _characterDetails.level*10+100);
//             unlimitedEvolution.safeTransferFrom(address(this), msg.sender, 5, 1, "");
//             emit LevelUp(_tokenId, _characterDetails.level);
//         }
//     }

//     /**
//      * @dev Fight algorithm: attack, defence and experience points are taken into account to determine a winner.
//      * @param _id1 Id of the token number 1.
//      * @param _id2 Id of the token number 2.
//      * @return Number resulting from fight operations.
//      */
//     function _substrateLife(uint24 _id1, uint24 _id2) external onlyOwner view returns(uint256) {
//         UnlimitedEvolution.Character memory _characterDetails1 = unlimitedEvolution.getTokenDetails(_id1);
//         UnlimitedEvolution.Character memory _characterDetails2 = unlimitedEvolution.getTokenDetails(_id2);
//         uint256 op1 = ((_characterDetails1.attack1 + _characterDetails1.attack2) / 2) * (1 + _characterDetails1.xp);
//         uint256 op2 = ((_characterDetails2.defence1 + _characterDetails2.defence2 ) / 2) * ((1 + _characterDetails2.xp) / 2);
//         if (op1 < op2) {
//             return 0;
//         } else {
//             return op1 - op2;
//         }
//     }

//     /**
//      * @dev The Function manages the different scenarios during a fight.
//      * @param _myTokenId Id of the token number 1.
//      * @param _rivalTokenId Id of the token number 2.
//      * @param _substrateLifeToRival Number of life points to remove from _rivalTokenId.
//      * @param _substrateLifeToMe Number of life points to remove from _myTokenId.
//      * Emits a "Fighted" event.
//      */
//     function _subtrateLifeOperation(uint24 _myTokenId, uint24 _rivalTokenId, uint256 _substrateLifeToRival, uint256 _substrateLifeToMe) external onlyOwner {
//         UnlimitedEvolution.Character memory _characterDetails1 = unlimitedEvolution.getTokenDetails(_myTokenId);
//         UnlimitedEvolution.Character memory _characterDetails2 = unlimitedEvolution.getTokenDetails(_rivalTokenId);
//         if(_substrateLifeToRival >= _characterDetails2.hp) {
//             _characterDetails2.hp = 0;
//             _xpLevelUp(_myTokenId);
//         } else {
//             _characterDetails2.hp = _characterDetails2.hp - uint24(_substrateLifeToRival);
//             if(_substrateLifeToMe >= _characterDetails1.hp) {
//                 _characterDetails1.hp = 0;
//                 _xpLevelUp(_rivalTokenId);
//             } else {
//                 _characterDetails1.hp = _characterDetails1.hp - uint24(_substrateLifeToMe);
//                 if (_substrateLifeToRival > _substrateLifeToMe) {
//                     _xpLevelUp(_myTokenId);
//                 } else if (_substrateLifeToMe > _substrateLifeToRival) {
//                     _xpLevelUp(_rivalTokenId);
//                 } else {
//                     _xpLevelUp(_myTokenId);
//                     _xpLevelUp(_rivalTokenId);
//                 }
//             }
//         }
//         emit Fighted(_myTokenId, _rivalTokenId, _substrateLifeToRival, _substrateLifeToMe);
//     }

//     // /**
//     //  * @dev The function allows you to use your NFT to fight with another NFT belonging to another user.
//     //  * @param _myTokenId Id of the fighter number 1.
//     //  * @param _rivalTokenId Id of the fighter number 2.
//     //  */
//     // function fight(UnlimitedEvolution.Character memory _characterDetails, uint24 _myTokenId, uint24 _rivalTokenId) external {
//     //     require(UnlimitedEvolution._ownerOf(_myTokenId), "You don't own this NFT");
//     //     require(UnlimitedEvolution._ownerOf(_myTokenId) != UnlimitedEvolution._ownerOf(_rivalTokenId), "Your NFTs cannot fight each other");
//     //     require(_characterDetails[_myTokenId].lastRest + 86400 < block.timestamp, "You're character is resting");
//     //     require(_characterDetails[_rivalTokenId].lastRest + 86400 < block.timestamp, "You're rival is resting");
//     //     require(_characterDetails[_myTokenId].stamina >= 10, "Not enough stamina");
//     //     require(_characterDetails[_myTokenId].level <= _characterDetails[_rivalTokenId].level, "Fight someone your own size!");
//     //     require(_characterDetails[_myTokenId].hp > 0 && _characterDetails[_rivalTokenId].hp > 0, "One of the NFTs is dead");
//     //     uint256 _substrateLifeToRival = _substrateLife(_myTokenId, _rivalTokenId);
//     //     uint256 _substrateLifeToMe = _substrateLife(_rivalTokenId, _myTokenId);
//     //     _characterDetails[_myTokenId].stamina = _characterDetails[_myTokenId].stamina - 10;
//     //     _subtrateLifeOperation(_myTokenId, _rivalTokenId, _substrateLifeToRival, _substrateLifeToMe);
//     // }
// }
