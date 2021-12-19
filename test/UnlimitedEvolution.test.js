const {
  expectRevert,
  expectEvent,
  time,
} = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const UnlimitedEvolution = artifacts.require('UnlimitedEvolution')

const readable = (val) => web3.utils.toWei(val, 'ether')

contract('UnlimitedEvolution', function (accounts) {
  let ue,
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
      ue = await UnlimitedEvolution.new({ from: owner })
    })

    it('a un nom', async function () {
      expect(await ue.name()).to.equal('UnlimitedEvolution')
    })

    it('a un symbole', async function () {
      expect(await ue.symbol()).to.equal('UEV')
    })

    it('Update fees', async function () {
      eventOwner = await ue.updateFees(
        readable('0.01'),
        readable('0.001'),
        readable('0.001'),
        { from: owner },
      )
      let mintFee = eventOwner.logs[0].args[0].toString()
      let healFee = eventOwner.logs[0].args[1].toString()
      let fightFee = eventOwner.logs[0].args[2].toString()
      expect(readable('0.01')).to.equal(mintFee)
      expect(readable('0.001')).to.equal(healFee)
      expect(readable('0.001')).to.equal(fightFee)

      expectEvent(eventOwner, 'FeesUpdated', {
        _mintFee: mintFee,
        _healFee: healFee,
        _fightFee: fightFee,
      })
    })

    it('REVERT: updateFees()', async function () {
      await expectRevert(
        ue.updateFees(readable('0.01'), readable('0.001'), readable('0.001'), {
          from: investor,
        }),
        'Ownable: caller is not the owner',
      )
    })

    it('Withdraw', async function () {
      balanceBefore = await web3.eth.getBalance(accounts[0])
      await ue.createCharacter(1, { value: readable('0.001'), from: investor })
      await ue.withdraw({ from: owner })
      balanceAfter = await web3.eth.getBalance(accounts[0])
      expect(parseInt(balanceBefore)).to.be.lt(parseInt(balanceAfter)) // lower than
    })

    it('REVERT: withdraw()', async function () {
      await expectRevert(
        ue.withdraw({ from: investor }),
        'Ownable: caller is not the owner',
      )
    })

    describe('Create a Character', async () => {
      it('Creation', async function () {
        balance = await ue.balanceOf(investor)
        expect(balance).to.be.bignumber.equal('0')

        eventInvestor = await ue.createCharacter(0, {
          value: readable('0.001'),
          from: investor,
        })

        balance = await ue.balanceOf(investor)
        expect(balance).to.be.bignumber.equal('1')

        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()
        let checkIfOwner = await ue.ownerOf(tokenIdInvestor)
        expect(checkIfOwner).to.equal(investor)

        expectEvent(eventInvestor, 'CharacterCreated', { id: tokenIdInvestor })
      })

      it('REVERT: createCharacter() Wrong amount of fees', async function () {
        await expectRevert(
          ue.createCharacter(0, { value: readable('0.01'), from: investor }),
          'Wrong amount of fees',
        )
      })

      it('REVERT: createCharacter() more than 5 NFTs', async function () {
        await ue.createCharacter(0, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(1, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(2, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(1, {
          value: readable('0.001'),
          from: investor,
        })
        await ue.createCharacter(0, {
          value: readable('0.001'),
          from: investor,
        })
        await expectRevert(
          ue.createCharacter(1, { value: readable('0.001'), from: investor }),
          "You can't have more than 5 NFT",
        )
      })

      it('REVERT: createCharacter() non-existent class', async function () {
        await expectRevert.unspecified(
          ue.createCharacter(3, { value: readable('0.001'), from: investor }),
        )
      })
    })

    describe('Fight', async () => {
      beforeEach(async function () {
        eventInvestor = await ue.createCharacter(1, {
          value: readable('0.001'),
          from: investor,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()

        eventOwner = await ue.createCharacter(0, {
          value: readable('0.001'),
          from: owner,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()
      })

      it('Fighting', async function () {
        let ownerDetailsBefore = await ue.getTokenDetails(tokenIdOwner)
        let investorDetailsBefore = await ue.getTokenDetails(tokenIdInvestor)

        await time.increase(61)
        let receipt = await ue.fight(tokenIdOwner, tokenIdInvestor, {
          value: readable('0.00001'),
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

        expectEvent(receipt, 'Fighted', {
          myTokenId: tokenIdOwner,
          rivalTokenId: tokenIdInvestor,
          substrateLifeToRival: receipt.logs[0].args[2],
          substrateLifeToMe: receipt.logs[0].args[3],
        })
      })

      it('REVERT: fight() Wrong amount of fees', async function () {
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            value: readable('0.00002'),
            from: owner,
          }),
          'Wrong amount of fees',
        )
      })

      it('REVERT: fight() Not Owner', async function () {
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            value: readable('0.00001'),
            from: investor,
          }),
          "You're not the owner of the NFT",
        )
      })

      it('REVERT: fight() between friends', async function () {
        let eventOwner2 = await ue.createCharacter(0, {
          value: readable('0.001'),
          from: owner,
        })
        let tokenIdOwner2 = eventOwner2.logs[1].args[0].toString()
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdOwner2, {
            value: readable('0.00001'),
            from: owner,
          }),
          'Your NFTs cannot fight each other',
        )
      })

      it('REVERT: fight() To soon', async function () {
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            value: readable('0.00001'),
            from: owner,
          }),
          'To soon to fight (1 min)',
        )
      })

      it('REVERT: fight() same level & expectEvent LevelUp', async function () {
        await time.increase(61)
        let eventInvestor2 = await ue.createCharacter(0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor2 = eventInvestor2.logs[1].args[0].toString()
        let tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)

        await time.increase(61)
        let eventInvestor3 = await ue.createCharacter(0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor3 = eventInvestor3.logs[1].args[0].toString()
        let tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)

        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        while (tokenDetailsInvestor2[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor2, {
            value: readable('0.00001'),
            from: owner,
          })
          await time.increase(61)
          tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
        }
        let receipt
        while (tokenDetailsInvestor3[4] > 0) {
          if (tokenDetailsOwner[2] > 1) {
            expectEvent(receipt, 'LevelUp', {
              tokenId: tokenIdOwner,
              level: tokenDetailsOwner[2],
            })
            break
          }
          receipt = await ue.fight(tokenIdOwner, tokenIdInvestor3, {
            value: readable('0.00001'),
            from: owner,
          })
          await time.increase(61)
          tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)
          tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        }

        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            value: readable('0.00001'),
            from: owner,
          }),
          ' Fight someone your own size!',
        )
      })

      it('REVERT: fight() dead one', async function () {
        await time.increase(61)
        let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        while (tokenDetailsInvestor[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor, {
            value: readable('0.00001'),
            from: owner,
          })
          await time.increase(61)
          tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        }
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            value: readable('0.00001'),
            from: owner,
          }),
          'One of the NFTs is dead',
        )
      })
    })

    describe('Spell', async () => {
      beforeEach(async function () {
        eventInvestor = await ue.createCharacter(1, {
          value: readable('0.001'),
          from: investor,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()

        eventOwner = await ue.createCharacter(0, {
          value: readable('0.001'),
          from: owner,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()
      })

      it('Spelling', async function () {
        let ownerDetailsBefore = await ue.getTokenDetails(tokenIdOwner)
        let investorDetailsBefore = await ue.getTokenDetails(tokenIdInvestor)

        await time.increase(61)
        let receipt = await ue.spell(tokenIdInvestor, tokenIdOwner, {
          value: readable('0.00001'),
          from: investor,
        })

        let substrateLifeToInvestor = receipt.logs[0].args[3]
        let substrateLifeToOwner = receipt.logs[0].args[2]

        let ownerDetailsAfter = await ue.getTokenDetails(tokenIdOwner)
        let investorDetailsAfter = await ue.getTokenDetails(tokenIdInvestor)

        expect(parseInt(ownerDetailsBefore[4] - substrateLifeToOwner)).to.equal(
          parseInt(ownerDetailsAfter[4]),
        )
        expect(
          parseInt(investorDetailsBefore[4] - substrateLifeToInvestor),
        ).to.equal(parseInt(investorDetailsAfter[4]))

        expect(parseInt(investorDetailsBefore[3]) + 1).to.equal(
          parseInt(investorDetailsAfter[3]),
        )

        expect(parseInt(investorDetailsBefore[5]) - 10).to.equal(
          parseInt(investorDetailsAfter[5]),
        )

        expectEvent(receipt, 'Fighted', {
          myTokenId: tokenIdInvestor,
          rivalTokenId: tokenIdOwner,
          substrateLifeToRival: receipt.logs[0].args[2],
          substrateLifeToMe: receipt.logs[0].args[3],
        })
      })

      it('REVERT: spell() not enough mana', async function () {
        await time.increase(61)
        await ue.spell(tokenIdOwner, tokenIdInvestor, {
          value: readable('0.00001'),
          from: owner,
        })
        await time.increase(61)
        await expectRevert(
          ue.spell(tokenIdOwner, tokenIdInvestor, {
            value: readable('0.00001'),
            from: owner,
          }),
          "You don't have enough mana",
        )
      })
    })

    describe('Heal', async () => {
      beforeEach(async function () {
        eventInvestor = await ue.createCharacter(1, {
          value: readable('0.001'),
          from: investor,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()
      })

      it('Healing', async function () {
        eventOwner = await ue.createCharacter(0, {
          value: readable('0.001'),
          from: owner,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()

        await time.increase(61)
        await ue.fight(tokenIdOwner, tokenIdInvestor, {
          value: readable('0.00001'),
          from: owner,
        })

        let tokenDetailsInvestorBefore = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        const receipt = await ue.heal(tokenIdInvestor, {
          value: readable('0.00001'),
          from: investor,
        })

        let tokenDetailsInvestorAfter = await ue.getTokenDetails(
          tokenIdInvestor,
        )

        expect(parseInt(tokenDetailsInvestorBefore[4])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[4]),
        )

        expectEvent(receipt, 'Healed', { tokenId: tokenIdInvestor })
      })

      it('REVERT: heal() Wrong amount of fees', async function () {
        await expectRevert(
          ue.heal(tokenIdInvestor, {
            value: readable('0.00002'),
            from: investor,
          }),
          'Wrong amount of fees',
        )
      })

      it('REVERT: heal() Not Owner', async function () {
        await expectRevert(
          ue.heal(tokenIdInvestor, { value: readable('0.00001'), from: owner }),
          "You're not the owner of the NFT",
        )
      })

      it('REVERT: heal() To soon', async function () {
        await expectRevert(
          ue.heal(tokenIdInvestor, {
            value: readable('0.00001'),
            from: investor,
          }),
          'To soon to heal (1 min)',
        )
      })

      it('REVERT: heal() Already healed', async function () {
        await time.increase(61)
        await expectRevert(
          ue.heal(tokenIdInvestor, {
            value: readable('0.00001'),
            from: investor,
          }),
          "You're character is already healed",
        )
      })
    })
  })
})
