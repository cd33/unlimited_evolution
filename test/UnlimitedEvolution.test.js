const {
  expectRevert,
  expectEvent,
  time,
} = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const UnlimitedEvolution = artifacts.require('UnlimitedEvolution')
const UnlimitedToken = artifacts.require('UnlimitedToken')
const RandomNumberGenerator = artifacts.require('RandomNumberGenerator')

const readable = (val) => web3.utils.toWei(val, 'ether')

contract('UnlimitedEvolution', function (accounts) {
  let ue,
    ut,
    rng,
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
      rng = await RandomNumberGenerator.new({
        from: owner,
      })
      ut = await UnlimitedToken.new({
        from: owner,
      })
      ue = await UnlimitedEvolution.new(ut.address, rng.address, {
        from: owner,
      })
      await ut.setGameContract(ue.address)
      await ut.approve(ue.address, readable('2000000'))
      await rng.setUnlimitedAddress(ue.address)
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

    it('Withdraw Ether', async function () {
      balanceBefore = await web3.eth.getBalance(owner)
      await ue.askCreateCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
      })
      await ue.askCreateCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
      })
      await ue.askCreateCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
      })
      await ue.withdrawEth({ from: owner })
      balanceAfter = await web3.eth.getBalance(owner)
      expect(parseInt(balanceBefore)).to.be.lt(parseInt(balanceAfter)) // lower than
    })

    it('REVERT: withdrawEth() owner', async function () {
      await expectRevert(
        ue.withdrawEth({ from: investor }),
        'Ownable: caller is not the owner',
      )
    })

    describe('Create a Character', async () => {
      it('Creation askCreateCharacter()', async function () {
        balance = await ue.getMyCharacters({ from: investor })
        expect(parseInt(balance.length)).to.equal(0)

        eventInvestor = await ue.askCreateCharacter(0, 0, {
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

      it('REVERT: askCreateCharacter() Wrong amount of fees', async function () {
        await expectRevert(
          ue.askCreateCharacter(0, 0, {
            value: readable('0.01'),
            from: investor,
          }),
          'Wrong amount of fees',
        )
      })

      it('askCreateCharacter() more than 5 NFTs', async function () {
        await ue.askCreateCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.askCreateCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.askCreateCharacter(2, 2, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.askCreateCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.askCreateCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        await expectRevert(
          ue.askCreateCharacter(1, 1, {
            value: readable('0.001'),
            from: investor,
          }),
          "You can't have more than 5 NFT",
        )
      })

      it('REVERT: askCreateCharacter() limiteMint', async function () {
        await ue.updateLimitMint(1, { from: owner })

        await ue.askCreateCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })

        await ue.askCreateCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })

        await expectRevert(
          ue.askCreateCharacter(0, 0, {
            value: readable('0.001'),
            from: investor,
          }),
          'You cannot mint more character with this class',
        )
      })

      it('REVERT: askCreateCharacter() non-existent class', async function () {
        await expectRevert.unspecified(
          ue.askCreateCharacter(3, 0, {
            value: readable('0.001'),
            from: investor,
          }),
        )
      })

      it('Creation createCharacter() only owner', async function () {
        balance = await ue.getMyCharacters({ from: owner })
        expect(parseInt(balance.length)).to.equal(0)

        eventOwner = await ue.createCharacter(0, 0, 121656, owner, {
          from: owner,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()

        balance = await ue.getMyCharacters({ from: owner })
        expect(parseInt(balance.length)).to.equal(1)

        await expectEvent(eventOwner, 'CharacterCreated', {
          id: tokenIdOwner,
        })
      })

      it('REVERT: createCharacter() not allowed', async function () {
        await expectRevert(
          ue.createCharacter(0, 0, 121656, investor, {
            from: investor,
          }),
          'Not allowed to use this function',
        )
      })
    })

    describe('Fight', async () => {
      beforeEach(async function () {
        eventInvestor = await ue.askCreateCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
          gas: 3000000,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()

        eventOwner = await ue.askCreateCharacter(0, 0, {
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

        expect(parseInt(ownerDetailsBefore[3] - substrateLifeToOwner)).to.equal(
          parseInt(ownerDetailsAfter[3]),
        )
        expect(
          parseInt(investorDetailsBefore[3] - substrateLifeToInvestor),
        ).to.equal(parseInt(investorDetailsAfter[3]))

        expect(parseInt(ownerDetailsBefore[2]) + 1).to.equal(
          parseInt(ownerDetailsAfter[2]),
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
        let eventOwner2 = await ue.askCreateCharacter(0, 0, {
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

      it('REVERT: fight() same level & expectEvent LevelUp & rewards', async function () {
        await ue.buyStuff(3, {
          value: readable('0.1'),
          from: owner,
        })
        await ue.equipStuff(tokenIdOwner, 3, {
          from: owner,
        })

        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        let balancePotion = await ue.balanceOf(owner, 5)
        expect(parseInt(balancePotion)).to.equal(0)
        let balanceTokenOwner = await ut.balanceOf(owner)
        expect(parseInt(balanceTokenOwner)).to.equal(0)

        while (tokenDetailsOwner[1] < 2) {
          while (tokenDetailsInvestor[3] > 0) {
            await ue.fight(tokenIdOwner, tokenIdInvestor, {
              from: owner,
            })
            tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
          }
          await ue.buyStuff(5, {
            value: readable('0.001'),
            from: investor,
          })
          await ue.usePotion(tokenIdInvestor, {
            from: investor,
          })
          tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
          tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        }

        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          }),
          'Fight someone your own size!',
        )

        balancePotion = await ue.balanceOf(owner, 5)
        expect(parseInt(balancePotion)).to.equal(1)

        balanceTokenOwner = await ut.balanceOf(owner)
        expect(parseInt(balanceTokenOwner)).to.equal(parseInt(readable('10000')))
      })

      it('REVERT: fight() resting', async function () {
        await ue.fight(tokenIdOwner, tokenIdInvestor, {
          from: owner,
        })

        await ue.rest(tokenIdOwner, {
          from: owner,
        })

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
        expect(parseInt(ownerDetails[4])).to.equal(90)

        await ue.rest(tokenIdOwner, {
          from: owner,
        })

        ownerDetails = await ue.getTokenDetails(tokenIdOwner)
        expect(parseInt(ownerDetails[4])).to.equal(100)

        await time.increase(86401)

        await ue.fight(tokenIdOwner, tokenIdInvestor, {
          from: owner,
        })

        ownerDetails = await ue.getTokenDetails(tokenIdOwner)
        expect(parseInt(ownerDetails[4])).to.equal(90)
      })

      it('REVERT: fight() not enough stamina', async function () {
        let eventInvestor2 = await ue.askCreateCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor2 = eventInvestor2.logs[1].args[0].toString()

        await ue.buyStuff(3, {
          value: readable('0.1'),
          from: investor,
        })
        await ue.equipStuff(tokenIdInvestor2, 3, {
          from: investor,
        })
        await ue.fight(tokenIdOwner, tokenIdInvestor2, {
          from: owner,
        })

        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)

        while (tokenDetailsOwner[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          })
          await ue.buyStuff(5, {
            value: readable('0.001'),
            from: investor,
          })
          await ue.usePotion(tokenIdInvestor, {
            from: investor,
          })
          tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
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
        while (tokenDetailsInvestor[3] > 0) {
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
        eventInvestor = await ue.askCreateCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()
      })

      it('Resting', async function () {
        eventOwner = await ue.askCreateCharacter(0, 0, {
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

        expect(parseInt(tokenDetailsInvestorBefore[3])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[3]),
        )
        expect(parseInt(tokenDetailsInvestorBefore[4])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[4]),
        )
        expect(parseInt(tokenDetailsInvestorBefore[12])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[12]),
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
        eventInvestor = await ue.askCreateCharacter(1, 1, {
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
        await ue.createStuff(10, 0, 1, 2, 3, readable('1'), 1, { from: owner })

        let balanceNewShield = await ue.balanceOf(ue.address, 6)
        expect(parseInt(balanceNewShield)).to.equal(10)

        let stuffDetails = await ue.getStuffDetails(6)
        expect(parseInt(stuffDetails[1])).to.equal(0)
        expect(parseInt(stuffDetails[2])).to.equal(1)
        expect(parseInt(stuffDetails[3])).to.equal(2)
        expect(parseInt(stuffDetails[4])).to.equal(3)
        expect(parseInt(stuffDetails[5])).to.equal(parseInt(readable('1')))
        expect(parseInt(stuffDetails[6])).to.equal(1)
      })

      it('Manage Stuff Modify Excalibur', async function () {
        let balanceExcalibur = await ue.balanceOf(ue.address, 3)
        expect(parseInt(balanceExcalibur)).to.equal(1)
        let excaliburDetails = await ue.getStuffDetails(3)
        expect(parseInt(excaliburDetails[1])).to.equal(10)
        expect(parseInt(excaliburDetails[2])).to.equal(10)
        expect(parseInt(excaliburDetails[3])).to.equal(10)
        expect(parseInt(excaliburDetails[4])).to.equal(10)
        expect(parseInt(excaliburDetails[5])).to.equal(
          parseInt(readable('0.1')),
        )
        expect(parseInt(excaliburDetails[6])).to.equal(0)

        await ue.manageStuff(3, 3, 100, 100, 100, 100, readable('1'), 1)

        balanceExcalibur = await ue.balanceOf(ue.address, 3)
        expect(parseInt(balanceExcalibur)).to.equal(4)

        excaliburDetails = await ue.getStuffDetails(3)
        expect(parseInt(excaliburDetails[1])).to.equal(100)
        expect(parseInt(excaliburDetails[2])).to.equal(100)
        expect(parseInt(excaliburDetails[3])).to.equal(100)
        expect(parseInt(excaliburDetails[4])).to.equal(100)
        expect(parseInt(excaliburDetails[5])).to.equal(parseInt(readable('1')))
        expect(parseInt(excaliburDetails[6])).to.equal(1)
      })

      it('Manage Stuff Create More Potions', async function () {
        let balancePotion = await ue.balanceOf(ue.address, 5)
        expect(parseInt(balancePotion)).to.equal(10 ** 6)

        await ue.manageStuff(5, 10, 0, 0, 0, 0, readable('0.001'), 0)

        balancePotion = await ue.balanceOf(ue.address, 5)
        expect(parseInt(balancePotion)).to.equal(1000010)
      })

      it('Manage Stuff Create Stuff', async function () {
        await ue.manageStuff(8, 10, 0, 1, 2, 3, readable('0.01'), 0)

        let balanceNewSword = await ue.balanceOf(ue.address, 8)
        expect(parseInt(balanceNewSword)).to.equal(10)

        let stuffDetails = await ue.getStuffDetails(8)
        expect(parseInt(stuffDetails[1])).to.equal(0)
        expect(parseInt(stuffDetails[2])).to.equal(1)
        expect(parseInt(stuffDetails[3])).to.equal(2)
        expect(parseInt(stuffDetails[4])).to.equal(3)
        expect(parseInt(stuffDetails[5])).to.equal(parseInt(readable('0.01')))
        expect(parseInt(stuffDetails[6])).to.equal(0)
      })

      it('Buy Stuff', async function () {
        eventInvestor = await ue.buyStuff(3, {
          value: readable('0.1'),
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
        await ue.buyStuff(3, { value: readable('0.1'), from: owner })
        await expectRevert(
          ue.buyStuff(3, { value: readable('0.1'), from: investor }),
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
        await ue.buyStuff(3, { value: readable('0.1'), from: investor })

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

        await ue.buyStuff(3, { value: readable('0.1'), from: investor })
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

        eventOwner = await ue.askCreateCharacter(0, 0, {
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

        expect(parseInt(investorDetailsBeforePotion[3])).to.be.lt(
          parseInt(investorDetailsAfterPotion[3]),
        )
        expect(parseInt(investorDetailsBeforePotion[4])).to.be.lt(
          parseInt(investorDetailsAfterPotion[4]),
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
        await ue.askCreateCharacter(1, 1, {
          value: readable('0.001'),
          from: owner,
        })
        let details = await ue.getTokenDetails(256, { from: owner })
        expect(parseInt(details.length)).to.equal(15)
      })

      it('getStuffDetails', async function () {
        let test = await ue.getStuffDetails(1, { from: owner })
        expect(parseInt(test.length)).to.equal(7)
      })

      it('getMyCharacters', async function () {
        let test = await ue.getMyCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(0)

        await ue.askCreateCharacter(1, 1, {
          value: readable('0.001'),
          from: owner,
        })

        test = await ue.getMyCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(1)
      })

      it('getOthersCharacters', async function () {
        await ue.askCreateCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
        })

        await ue.askCreateCharacter(2, 0, {
          value: readable('0.001'),
          from: investor,
        })

        let test = await ue.getMyCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(0)

        test = await ue.getOthersCharacters({ from: owner })
        expect(parseInt(test.length)).to.equal(2)
      })

      it('GetMyStuffs', async function () {
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
        let balance = await ue.balanceOf(owner, 1)
        expect(parseInt(balance)).to.equal(3)

        balance = await ue.balanceOf(owner, 4)
        expect(parseInt(balance)).to.equal(0)

        await ue.buyStuff(5, {
          value: readable('0.001'),
          from: owner,
        })
        await ue.buyStuff(5, {
          value: readable('0.001'),
          from: owner,
        })
        balance = await ue.balanceOf(owner, 5)
        expect(parseInt(balance)).to.equal(2)

        let test = await ue.getMyStuffs({ from: owner })
        expect(parseInt(test.length)).to.equal(1)
      })
    })
  })
})
