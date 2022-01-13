const {
  expectRevert,
  expectEvent,
  time,
} = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const UnlimitedEvolution = artifacts.require('UnlimitedEvolution')
const UnlimitedToken = artifacts.require('UnlimitedToken')

const readable = (val) => web3.utils.toWei(val, 'ether')

contract('UnlimitedEvolution', function (accounts) {
  let ue,
    ut,
    balance,
    balanceBefore,
    balanceAfter,
    eventInvestor,
    eventOwner,
    tokenIdInvestor,
    tokenIdOwner
  const owner = accounts[0]
  const investor = accounts[1]

  describe('UE Tests', async () => {
    beforeEach(async function () {
      ut = await UnlimitedToken.new({
        from: owner,
      })
      ue = await UnlimitedEvolution.new(ut.address, { from: owner })
      await ut.setGameContract(ue.address)
      await ue.testModeSwitch()
    })

    it('Update Mint Fee', async function () {
      eventOwner = await ue.updateMintFee(readable('0.01'), { from: owner })
      let mintFee = eventOwner.logs[0].args[0].toString()
      expect(readable('0.01')).to.equal(mintFee)

      await expectEvent(eventOwner, 'MintFeeUpdated', { mintFee: mintFee })
    })

    it('REVERT: updateMintFee() owner', async function () {
      await expectRevert(
        ue.updateMintFee(readable('0.01'), {
          from: investor,
        }),
        'Ownable: caller is not the owner',
      )
    })

    it('Update Stuff Fee', async function () {
      eventOwner = await ue.updateStuffFee(readable('0.01'), { from: owner })
      let stuffFee = eventOwner.logs[0].args[0].toString()
      expect(readable('0.01')).to.equal(stuffFee)

      await expectEvent(eventOwner, 'StuffFeeUpdated', { stuffFee: stuffFee })
    })

    it('REVERT: updateStuffFee() owner', async function () {
      await expectRevert(
        ue.updateStuffFee(readable('0.01'), {
          from: investor,
        }),
        'Ownable: caller is not the owner',
      )
    })

    it('Update limit mint', async function () {
      eventOwner = await ue.updateLimitMint(10, { from: owner })
      let limitMint = eventOwner.logs[0].args[0].toString()
      expect(10).to.equal(parseInt(limitMint))

      await expectEvent(eventOwner, 'LimitUpdated', { limitMint: limitMint })
    })

    it('REVERT: updateLimitMint() owner', async function () {
      await expectRevert(
        ue.updateLimitMint(10, {
          from: investor,
        }),
        'Ownable: caller is not the owner',
      )
    })

    it('Withdraw', async function () {
      balanceBefore = await web3.eth.getBalance(owner)
      await ue.createCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
      })
      await ue.createCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
      })
      await ue.createCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
      })
      await ue.withdraw({ from: owner })
      balanceAfter = await web3.eth.getBalance(owner)
      expect(parseInt(balanceBefore)).to.be.lt(parseInt(balanceAfter)) // lower than
    })

    it('REVERT: withdraw() owner', async function () {
      await expectRevert(
        ue.withdraw({ from: investor }),
        'Ownable: caller is not the owner',
      )
    })

    describe('Create a Character', async () => {
      it('Creation', async function () {
        balance = await ue.getMyCharacters({ from: investor })
        expect(parseInt(balance.length)).to.equal(0)

        eventInvestor = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()

        balance = await ue.getMyCharacters({ from: investor })
        expect(parseInt(balance.length)).to.equal(1)

        await expectEvent(eventInvestor, 'CharacterCreated', {
          id: tokenIdInvestor,
        })
      })

      it('REVERT: createCharacter() Wrong amount of fees', async function () {
        await expectRevert(
          ue.createCharacter(0, 0, { value: readable('0.01'), from: investor }),
          'Wrong amount of fees',
        )
      })

      it('createCharacter() more than 5 NFTs', async function () {
        await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(2, 2, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        await expectRevert(
          ue.createCharacter(1, 1, {
            value: readable('0.001'),
            from: investor,
          }),
          "You can't have more than 5 NFT",
        )
      })

      it('REVERT: createCharacter() limiteMint', async function () {
        await ue.updateLimitMint(1, { from: owner })

        await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })

        await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })

        await expectRevert(
          ue.createCharacter(0, 0, {
            value: readable('0.001'),
            from: investor,
          }),
          'You cannot mint more character with this class',
        )
      })

      it('REVERT: createCharacter() non-existent class', async function () {
        await expectRevert.unspecified(
          ue.createCharacter(3, 0, {
            value: readable('0.001'),
            from: investor,
          }),
        )
      })
    })

    describe('Fight', async () => {
      beforeEach(async function () {
        eventInvestor = await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
          gas: 3000000,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()

        eventOwner = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: owner,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()

        await ue.buyStuff(1, {
          value: readable('0.001'),
          from: owner,
        })
        await ue.buyStuff(2, {
          value: readable('0.001'),
          from: owner,
        })
        await ue.equipStuff(tokenIdOwner, 1, {
          from: owner,
        })
        await ue.equipStuff(tokenIdOwner, 2, {
          from: owner,
        })
      })

      it('Fighting', async function () {
        let ownerDetailsBefore = await ue.getTokenDetails(tokenIdOwner)
        let investorDetailsBefore = await ue.getTokenDetails(tokenIdInvestor)

        let receipt = await ue.fight(tokenIdOwner, tokenIdInvestor, {
          from: owner,
        })

        let substrateLifeToInvestor = receipt.logs[0].args[2]
        let substrateLifeToOwner = receipt.logs[0].args[3]

        let ownerDetailsAfter = await ue.getTokenDetails(tokenIdOwner)
        let investorDetailsAfter = await ue.getTokenDetails(tokenIdInvestor)

        expect(parseInt(ownerDetailsBefore[4] - substrateLifeToOwner)).to.equal(
          parseInt(ownerDetailsAfter[4]),
        )
        expect(
          parseInt(investorDetailsBefore[4] - substrateLifeToInvestor),
        ).to.equal(parseInt(investorDetailsAfter[4]))

        expect(parseInt(ownerDetailsBefore[3]) + 1).to.equal(
          parseInt(ownerDetailsAfter[3]),
        )

        await expectEvent(receipt, 'Fighted', {
          myTokenId: tokenIdOwner,
          rivalTokenId: tokenIdInvestor,
          substrateLifeToRival: receipt.logs[0].args[2],
          substrateLifeToMe: receipt.logs[0].args[3],
        })
      })

      it('REVERT: fight() Not Owner', async function () {
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: investor,
          }),
          "You don't own this NFT",
        )
      })

      it('REVERT: fight() between friends', async function () {
        let eventOwner2 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: owner,
        })
        let tokenIdOwner2 = eventOwner2.logs[1].args[0].toString()
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdOwner2, {
            from: owner,
          }),
          'Your NFTs cannot fight each other',
        )
      })

      it('REVERT: fight() same level & expectEvent LevelUp', async function () {
        let eventInvestor2 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor2 = eventInvestor2.logs[1].args[0].toString()
        let tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)

        let eventInvestor3 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor3 = eventInvestor3.logs[1].args[0].toString()
        let tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)

        await ue.buyStuff(3, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.equipStuff(tokenIdInvestor3, 3, {
          from: investor,
        })

        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        let receipt
        let balancePotion = await ue.balanceOf(owner, 5)
        expect(parseInt(balancePotion)).to.equal(0)
        let balanceOwner = await ut.balanceOf(owner)
        expect(parseInt(balanceOwner)).to.equal(0)

        while (tokenDetailsInvestor2[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor2, {
            from: owner,
          })
          tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
        }
        while (tokenDetailsInvestor3[4] > 0) {
          if (tokenDetailsOwner[2] > 1) {
            await expectEvent(receipt, 'LevelUp', {
              tokenId: tokenIdOwner,
              level: tokenDetailsOwner[2],
            })
            balancePotion = await ue.balanceOf(owner, 5)
            expect(parseInt(balancePotion)).to.equal(1)

            balanceOwner = await ut.balanceOf(owner)
            expect(parseInt(balanceOwner)).to.equal(120 * 10 ** 18)

            break
          }
          receipt = await ue.fight(tokenIdOwner, tokenIdInvestor3, {
            from: owner,
          })

          tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)
          tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        }
        let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        if (tokenDetailsOwner[2] == 1) {
          while (tokenDetailsInvestor[4] > 0) {
            if (tokenDetailsOwner[2] > 1) {
              await expectEvent(receipt, 'LevelUp', {
                tokenId: tokenIdOwner,
                level: tokenDetailsOwner[2],
              })
              balancePotion = await ue.balanceOf(owner, 5)
              expect(parseInt(balancePotion)).to.equal(1)

              balanceOwner = await ut.balanceOf(owner)
              expect(parseInt(balanceOwner)).to.equal(120 * 10 ** 18)

              break
            }
            receipt = await ue.fight(tokenIdOwner, tokenIdInvestor, {
              from: owner,
            })

            tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
            tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
          }
        }

        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          }),
          'Fight someone your own size!',
        )
      })

      it('REVERT: fight() resting', async function () {
        let test = await ue.getTokenDetails(tokenIdOwner)

        await ue.fight(tokenIdOwner, tokenIdInvestor, {
          from: owner,
        })

        await ue.rest(tokenIdOwner, {
          from: owner,
        })

        test = await ue.getTokenDetails(tokenIdOwner)

        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          }),
          "You're character is resting",
        )
      })

      it('Fight resting after 24h', async function () {
        await ue.fight(tokenIdOwner, tokenIdInvestor, {
          from: owner,
        })

        let ownerDetails = await ue.getTokenDetails(tokenIdOwner)
        expect(parseInt(ownerDetails[5])).to.equal(90)

        await ue.rest(tokenIdOwner, {
          from: owner,
        })

        ownerDetails = await ue.getTokenDetails(tokenIdOwner)
        expect(parseInt(ownerDetails[5])).to.equal(100)

        await time.increase(86401)

        await ue.fight(tokenIdOwner, tokenIdInvestor, {
          from: owner,
        })

        ownerDetails = await ue.getTokenDetails(tokenIdOwner)
        expect(parseInt(ownerDetails[5])).to.equal(90)
      })

      it('REVERT: fight() not enough stamina', async function () {
        let eventInvestor2 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor2 = eventInvestor2.logs[1].args[0].toString()
        let tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)

        let eventInvestor3 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor3 = eventInvestor3.logs[1].args[0].toString()
        let tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)

        await ue.buyStuff(3, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.equipStuff(tokenIdInvestor, 3, {
          from: investor,
        })

        let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)

        await ue.fight(tokenIdOwner, tokenIdInvestor, {
          from: owner,
        })

        while (tokenDetailsInvestor2[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor2, {
            from: owner,
          })
          tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
        }
        while (tokenDetailsInvestor3[4] > 0) {
          if (tokenDetailsOwner[5] == 0) {
            break
          }
          await ue.fight(tokenIdOwner, tokenIdInvestor3, {
            from: owner,
          })

          tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)
          tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        }
        if (tokenDetailsOwner[5] != 0) {
          while (tokenDetailsInvestor[4] > 0) {
            if (tokenDetailsOwner[5] == 0) {
              break
            }
            await ue.fight(tokenIdOwner, tokenIdInvestor, {
              from: owner,
            })

            tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
            tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
          }
        }

        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          }),
          'Not enough stamina',
        )
      })

      it('REVERT: fight() dead one', async function () {
        let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        while (tokenDetailsInvestor[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          })
          tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        }
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          }),
          'One of the NFTs is dead',
        )
      })
    })

    describe('Rest', async () => {
      beforeEach(async function () {
        eventInvestor = await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()
      })

      it('Resting', async function () {
        eventOwner = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: owner,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()

        await time.increase(61)
        await ue.fight(tokenIdInvestor, tokenIdOwner, {
          from: investor,
        })

        let tokenDetailsInvestorBefore = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        const receipt = await ue.rest(tokenIdInvestor, {
          from: investor,
        })

        let tokenDetailsInvestorAfter = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        expect(parseInt(tokenDetailsInvestorBefore[4])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[4]),
        )
        expect(parseInt(tokenDetailsInvestorBefore[5])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[5]),
        )
        expect(parseInt(tokenDetailsInvestorBefore[13])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[13]),
        )

        await expectEvent(receipt, 'Rested', { tokenId: tokenIdInvestor })
      })

      it('REVERT: rest() Not Owner', async function () {
        await expectRevert(
          ue.rest(tokenIdInvestor, { from: owner }),
          "You don't own this NFT",
        )
      })

      it('REVERT: rest() Already rested', async function () {
        await time.increase(61)
        await expectRevert(
          ue.rest(tokenIdInvestor, {
            from: investor,
          }),
          "You're character is already rested",
        )
      })
    })

    describe('Stuff', async () => {
      beforeEach(async function () {
        eventInvestor = await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()
      })

      it('Constructor Balances Stuff', async function () {
        let balanceBasicSword = await ue.balanceOf(ue.address, 1)
        let balanceBasicShield = await ue.balanceOf(ue.address, 2)
        let balanceExcalibur = await ue.balanceOf(ue.address, 3)
        let balanceAegis = await ue.balanceOf(ue.address, 4)
        let balancePotion = await ue.balanceOf(ue.address, 5)

        expect(parseInt(balanceBasicSword)).to.equal(10 ** 5)
        expect(parseInt(balanceBasicShield)).to.equal(10 ** 5)
        expect(parseInt(balanceExcalibur)).to.equal(1)
        expect(parseInt(balanceAegis)).to.equal(1)
        expect(parseInt(balancePotion)).to.equal(10 ** 6)
      })

      it('Create Stuff', async function () {
        await ue.createStuff(10, 0, 1, 2, 3, 1, { from: owner })

        let balanceNewShield = await ue.balanceOf(ue.address, 6)
        expect(parseInt(balanceNewShield)).to.equal(10)

        let stuffDetails = await ue.getStuffDetails(6)
        expect(parseInt(stuffDetails[1])).to.equal(0)
        expect(parseInt(stuffDetails[2])).to.equal(1)
        expect(parseInt(stuffDetails[3])).to.equal(2)
        expect(parseInt(stuffDetails[4])).to.equal(3)
        expect(parseInt(stuffDetails[5])).to.equal(1)
      })

      it('Manage Stuff Modify Excalibur', async function () {
        let balanceExcalibur = await ue.balanceOf(ue.address, 3)
        expect(parseInt(balanceExcalibur)).to.equal(1)
        let excaliburDetails = await ue.getStuffDetails(3)
        expect(parseInt(excaliburDetails[1])).to.equal(10)
        expect(parseInt(excaliburDetails[2])).to.equal(10)
        expect(parseInt(excaliburDetails[3])).to.equal(10)
        expect(parseInt(excaliburDetails[4])).to.equal(10)
        expect(parseInt(excaliburDetails[5])).to.equal(0)

        await ue.manageStuff(3, 3, 100, 100, 100, 100, 1)

        balanceExcalibur = await ue.balanceOf(ue.address, 3)
        expect(parseInt(balanceExcalibur)).to.equal(4)

        excaliburDetails = await ue.getStuffDetails(3)
        expect(parseInt(excaliburDetails[1])).to.equal(100)
        expect(parseInt(excaliburDetails[2])).to.equal(100)
        expect(parseInt(excaliburDetails[3])).to.equal(100)
        expect(parseInt(excaliburDetails[4])).to.equal(100)
        expect(parseInt(excaliburDetails[5])).to.equal(1)
      })

      it('Manage Stuff Create More Potions', async function () {
        let balancePotion = await ue.balanceOf(ue.address, 5)
        expect(parseInt(balancePotion)).to.equal(10 ** 6)

        await ue.manageStuff(5, 10, 0, 0, 0, 0, 0)

        balancePotion = await ue.balanceOf(ue.address, 5)
        expect(parseInt(balancePotion)).to.equal(1000010)
      })

      it('Manage Stuff Create Stuff', async function () {
        await ue.manageStuff(8, 10, 0, 1, 2, 3, 0)

        let balanceNewSword = await ue.balanceOf(ue.address, 8)
        expect(parseInt(balanceNewSword)).to.equal(10)

        let stuffDetails = await ue.getStuffDetails(8)
        expect(parseInt(stuffDetails[1])).to.equal(0)
        expect(parseInt(stuffDetails[2])).to.equal(1)
        expect(parseInt(stuffDetails[3])).to.equal(2)
        expect(parseInt(stuffDetails[4])).to.equal(3)
        expect(parseInt(stuffDetails[5])).to.equal(0)
      })

      it('Buy Stuff', async function () {
        eventInvestor = await ue.buyStuff(3, {
          value: readable('0.001'),
          from: investor,
        })

        let balanceExcalibur = await ue.balanceOf(investor, 3)

        expect(parseInt(balanceExcalibur)).to.equal(1)

        let stuffId = eventInvestor.logs[1].args[0].toString()
        await expectEvent(eventInvestor, 'StuffBought', { stuffId: stuffId })
      })

      it('REVERT: buyStuff() ID 0 Non-existent', async function () {
        await expectRevert(
          ue.buyStuff(0, { value: readable('0.001'), from: investor }),
          'Non-existent stuff',
        )
      })

      it('REVERT: buyStuff() Stuff no more available', async function () {
        await ue.buyStuff(3, { value: readable('0.001'), from: owner })
        await expectRevert(
          ue.buyStuff(3, { value: readable('0.001'), from: investor }),
          'Stuff no more available',
        )
      })

      it('REVERT: buyStuff() Wrong amount of fees', async function () {
        await expectRevert(
          ue.buyStuff(2, { value: readable('0.01'), from: investor }),
          'Wrong amount of fees',
        )
      })

      it('Equip Stuff without stuff before', async function () {
        await ue.buyStuff(3, { value: readable('0.001'), from: investor })

        let tokenDetailsInvestorBefore = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        eventInvestor = await ue.equipStuff(tokenIdInvestor, 3, {
          from: investor,
        })

        let tokenDetailsInvestorAfter = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        expect(parseInt(tokenDetailsInvestorAfter.attack1)).to.equal(
          parseInt(tokenDetailsInvestorBefore.attack1) + 10,
        )
        expect(parseInt(tokenDetailsInvestorAfter.attack2)).to.equal(
          parseInt(tokenDetailsInvestorBefore.attack2) + 10,
        )
        expect(parseInt(tokenDetailsInvestorAfter.defence1)).to.equal(
          parseInt(tokenDetailsInvestorBefore.defence1) + 10,
        )
        expect(parseInt(tokenDetailsInvestorAfter.defence2)).to.equal(
          parseInt(tokenDetailsInvestorBefore.defence2) + 10,
        )

        expect(parseInt(tokenDetailsInvestorAfter.weapon)).to.equal(3)

        let stuffId = eventInvestor.logs[0].args[1].toString()
        await expectEvent(eventInvestor, 'StuffEquiped', {
          tokenId: tokenIdInvestor,
          stuffId: stuffId,
        })
      })

      it('Equip Stuff with stuff before', async function () {
        let tokenDetailsInvestorWithoutStuff = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        await ue.buyStuff(1, { value: readable('0.001'), from: investor })
        eventInvestor = await ue.equipStuff(tokenIdInvestor, 1, {
          from: investor,
        })

        let tokenDetailsInvestorAfter = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        expect(parseInt(tokenDetailsInvestorAfter.attack1)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.attack1) + 2,
        )
        expect(parseInt(tokenDetailsInvestorAfter.attack2)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.attack2) + 2,
        )
        expect(parseInt(tokenDetailsInvestorAfter.defence1)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.defence1),
        )
        expect(parseInt(tokenDetailsInvestorAfter.defence2)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.defence2),
        )
        expect(parseInt(tokenDetailsInvestorAfter.weapon)).to.equal(1)

        await ue.buyStuff(3, { value: readable('0.001'), from: investor })
        eventInvestor = await ue.equipStuff(tokenIdInvestor, 3, {
          from: investor,
        })

        tokenDetailsInvestorAfter = await ue.getTokenDetails(tokenIdInvestor)

        expect(parseInt(tokenDetailsInvestorAfter.attack1)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.attack1) + 10,
        )
        expect(parseInt(tokenDetailsInvestorAfter.attack2)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.attack2) + 10,
        )
        expect(parseInt(tokenDetailsInvestorAfter.defence1)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.defence1) + 10,
        )
        expect(parseInt(tokenDetailsInvestorAfter.defence2)).to.equal(
          parseInt(tokenDetailsInvestorWithoutStuff.defence2) + 10,
        )
        expect(parseInt(tokenDetailsInvestorAfter.weapon)).to.equal(3)

        let stuffId = eventInvestor.logs[0].args[1].toString()
        await expectEvent(eventInvestor, 'StuffEquiped', {
          tokenId: tokenIdInvestor,
          stuffId: stuffId,
        })
      })

      it('REVERT: equiStuff() Wrong kind of NFT', async function () {
        await expectRevert(
          ue.equipStuff(0, 2, { from: investor }),
          'Wrong kind of NFT (Stuff)',
        )
      })

      it('REVERT: equiStuff() Not owner NFT', async function () {
        await expectRevert(
          ue.equipStuff(258, 2, { from: investor }),
          "You don't own this NFT",
        )
      })

      it('REVERT: equiStuff() equip potion', async function () {
        await ue.buyStuff(5, { value: readable('0.001'), from: investor })
        await expectRevert(
          ue.equipStuff(tokenIdInvestor, 5, { from: investor }),
          "You can't equip a potion",
        )
      })

      it('REVERT: equiStuff() Not owner stuff', async function () {
        await expectRevert(
          ue.equipStuff(tokenIdInvestor, 0, { from: investor }),
          "You don't own this stuff",
        )
      })

      it('Use Potion', async function () {
        let balancePotion = await ue.balanceOf(investor, 5)
        expect(parseInt(balancePotion)).to.equal(0)

        await ue.buyStuff(5, { value: readable('0.001'), from: investor })

        balancePotion = await ue.balanceOf(investor, 5)
        expect(parseInt(balancePotion)).to.equal(1)

        eventOwner = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: owner,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()

        await ue.fight(tokenIdInvestor, tokenIdOwner, {
          from: investor,
        })

        let investorDetailsBeforePotion = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        eventInvestor = await ue.usePotion(tokenIdInvestor, {
          from: investor,
        })

        balancePotion = await ue.balanceOf(investor, 5)
        expect(parseInt(balancePotion)).to.equal(0)

        let investorDetailsAfterPotion = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        expect(parseInt(investorDetailsBeforePotion[4])).to.be.lt(
          parseInt(investorDetailsAfterPotion[4]),
        )
        expect(parseInt(investorDetailsBeforePotion[5])).to.be.lt(
          parseInt(investorDetailsAfterPotion[5]),
        )

        await expectEvent(eventInvestor, 'PotionUsed', {
          tokenId: tokenIdInvestor,
        })
      })

      it('REVERT: usePotion() Wrong kind of NFT', async function () {
        await expectRevert(
          ue.usePotion(2, { from: investor }),
          'Wrong kind of NFT (Stuff)',
        )
      })

      it('REVERT: usePotion() Not owner NFT', async function () {
        await expectRevert(
          ue.usePotion(258, { from: investor }),
          "You don't own this NFT",
        )
      })

      it('REVERT: usePotion() Not owner potion', async function () {
        await expectRevert(
          ue.usePotion(tokenIdInvestor, { from: investor }),
          "You don't own a potion",
        )
      })

      it('REVERT: usePotion() Already rested', async function () {
        await ue.buyStuff(5, { value: readable('0.001'), from: investor })
        await expectRevert(
          ue.usePotion(tokenIdInvestor, { from: investor }),
          "You're character is already rested",
        )
      })
    })

    describe('Getters', async () => {
      it('getTokenDetails', async function () {
        await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: owner,
        })
        let test = await ue.getTokenDetails(256, { from: owner })
        expect(parseInt(test.length)).to.equal(16)
      })

      it('getStuffDetails', async function () {
        let test = await ue.getStuffDetails(1, { from: owner })
        expect(parseInt(test.length)).to.equal(6)
      })

      it('getMyCharacters', async function () {
        let test = await ue.getMyCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(0)

        await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: owner,
        })

        test = await ue.getMyCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(1)
      })

      it('getOthersCharacters', async function () {
        await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })

        let test = await ue.getMyCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(0)

        test = await ue.getOthersCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(1)
      })

      it('GetMyStuffs & getBalanceStuff', async function () {
        await ue.buyStuff(1, {
          value: readable('0.001'),
          from: owner,
        })
        await ue.buyStuff(1, {
          value: readable('0.001'),
          from: owner,
        })
        await ue.buyStuff(1, {
          value: readable('0.001'),
          from: owner,
        })
        let balance = await ue.getBalanceStuff(1)
        expect(parseInt(balance)).to.equal(3)

        balance = await ue.getBalanceStuff(4)
        expect(parseInt(balance)).to.equal(0)

        await ue.buyStuff(5, {
          value: readable('0.001'),
          from: owner,
        })
        await ue.buyStuff(5, {
          value: readable('0.001'),
          from: owner,
        })
        balance = await ue.getBalanceStuff(5)
        expect(parseInt(balance)).to.equal(2)

        let test = await ue.getMyStuffs({ from: owner })
        expect(parseInt(test.length)).to.equal(1)
      })
    })
  })
})
