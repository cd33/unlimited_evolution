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
      await ue.testModeSwitch();
    })

    it('Update fee', async function () {
      eventOwner = await ue.updateFee(readable('0.01'), { from: owner })
      let mintFee = eventOwner.logs[0].args[0].toString()
      expect(readable('0.01')).to.equal(mintFee)

      await expectEvent(eventOwner, 'FeeUpdated', { mintFee: mintFee })
    })

    it('REVERT: updateFee() owner', async function () {
      await expectRevert(
        ue.updateFee(readable('0.01'), {
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
        gas: 3000000,
      })
      await ue.createCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
        gas: 3000000,
      })
      await ue.createCharacter(1, 1, {
        value: readable('0.001'),
        from: investor,
        gas: 3000000,
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
        balance = await ue.getBalanceOfCharacters(investor)
        expect(balance).to.be.bignumber.equal('0')

        eventInvestor = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
          gas: 3000000,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()

        balance = await ue.getBalanceOfCharacters(investor)
        expect(balance).to.be.bignumber.equal('1')

        await expectEvent(eventInvestor, 'CharacterCreated', { id: tokenIdInvestor })
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
          gas: 3000000,
        })
        await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
          gas: 3000000,
        })
        await ue.createCharacter(2, 2, {
          value: readable('0.001'),
          from: investor,
          gas: 3000000,
        })
        await ue.createCharacter(1, 1, {
          value: readable('0.001'),
          from: investor,
          gas: 3000000,
        })
        await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
          gas: 3000000,
        })
        await expectRevert(
          ue.createCharacter(1, 1, {
            value: readable('0.001'),
            from: investor,
            gas: 3000000,
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
          gas: 3000000,
        })
        tokenIdOwner = eventOwner.logs[1].args[0].toString()
      })

      it('Fighting', async function () {
        let ownerDetailsBefore = await ue.getTokenDetails(tokenIdOwner)
        let investorDetailsBefore = await ue.getTokenDetails(tokenIdInvestor)

        await time.increase(61)
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

        if ((investorDetailsBefore[6] + investorDetailsBefore[7]) > (ownerDetailsBefore[6] + ownerDetailsBefore[7])) {
          expect(parseInt(investorDetailsBefore[3]) + 1).to.equal(
            parseInt(investorDetailsAfter[3]),
          )
        } else {
          expect(parseInt(ownerDetailsBefore[3]) + 1).to.equal(
            parseInt(ownerDetailsAfter[3]),
          )
        }

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
          "You're not the owner of the NFT",
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

      it('REVERT: fight() To soon', async function () {
        await expectRevert(
          ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          }),
          'To soon to fight (1 min)',
        )
      })

      // // TODO QUAND ALGO COMBAT PRET
      // it('REVERT: fight() not enough stamina', async function () {
      //   await time.increase(61)
      //   let eventInvestor2 = await ue.createCharacter(0, 0, {
      //     value: readable('0.001'),
      //     from: investor,
      //   })
      //   let tokenIdInvestor2 = eventInvestor2.logs[1].args[0].toString()
      //   let tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)

      //   let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
      //   // while (tokenDetailsInvestor2[4] > 0) {
      //   //   await ue.fight(tokenIdOwner, tokenIdInvestor2, {
      //   //     from: owner,
      //   //   })
      //   //   await time.increase(61)
      //   //   tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
      //   // }
      //   // let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
      //   // while (tokenDetailsInvestor[4] > 0) {
      //   //   if (tokenDetailsOwner[5] < 10) {
      //   //     break
      //   //   }
      //   //   await ue.fight(tokenIdOwner, tokenIdInvestor, {
      //   //     from: owner,
      //   //   })
      //   //   await time.increase(61)
      //   //   tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
      //   //   tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
      //   // }

      //   // TEMPORAIRE
      //   await time.increase(61)
      //   let eventInvestor3 = await ue.createCharacter(0, 0, {
      //     value: readable('0.001'),
      //     from: investor,
      //   })
      //   let tokenIdInvestor3 = eventInvestor3.logs[1].args[0].toString()

      //   while (tokenDetailsInvestor[4] > 0) {
      //     await ue.fight(tokenIdOwner, tokenIdInvestor, {
      //       from: owner,
      //     })
      //     await time.increase(61)
      //   }

      //   while (tokenDetailsInvestor3[4] > 0) {
      //     await ue.fight(tokenIdInvestor2, tokenIdInvestor3, {
      //       from: investor,
      //     })
      //     await time.increase(61)
      //   }
      //   // TEMPORAIRE
      //   await expectRevert(
      //     ue.fight(tokenIdOwner, tokenIdInvestor2, {
      //       from: owner,
      //     }),
      //     'Not enough stamina',
      //   )
      // })

      it('REVERT: fight() same level & expectEvent LevelUp', async function () {
        await time.increase(61)
        let eventInvestor2 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor2 = eventInvestor2.logs[1].args[0].toString()
        let tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)

        await time.increase(61)
        let eventInvestor3 = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: investor,
        })
        let tokenIdInvestor3 = eventInvestor3.logs[1].args[0].toString()
        let tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)

        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        let receipt

        if ((tokenDetailsInvestor2[6] + tokenDetailsInvestor2[7]) > (tokenDetailsOwner[6] + tokenDetailsOwner[7])) {
          while (tokenDetailsOwner[4] > 0) {
            if (tokenDetailsInvestor2[2] > 1) {
              await expectEvent(receipt, 'LevelUp', {
                tokenId: tokenIdInvestor2,
                level: tokenDetailsInvestor2[2],
              })
              await expectRevert(
                ue.fight(tokenIdInvestor2, tokenIdOwner, {
                  from: investor,
                }),
                'Fight someone your own size!',
              )
            }
            receipt = await ue.fight(tokenIdInvestor2, tokenIdOwner, {
              from: investor,
            })
            await time.increase(61)
            tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
            tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
          }

          await time.increase(61)
          let eventOwner2 = await ue.createCharacter(0, 0, {
            value: readable('0.001'),
            from: owner,
          })
          let tokenIdOwner2 = eventOwner2.logs[1].args[0].toString()
          let tokenDetailsOwner2 = await ue.getTokenDetails(tokenIdOwner2)

          while (tokenDetailsOwner2[4] > 0) {
            if (tokenDetailsInvestor2[2] > 1) {
              await expectEvent(receipt, 'LevelUp', {
                tokenId: tokenIdInvestor2,
                level: tokenDetailsInvestor2[2],
              })
              await expectRevert(
                ue.fight(tokenIdInvestor2, tokenIdOwner2, {
                  from: investor,
                }),
                'Fight someone your own size!',
              )
            }
            receipt = await ue.fight(tokenIdInvestor2, tokenIdOwner2, {
              from: investor,
            })
            await time.increase(61)
            tokenDetailsOwner2 = await ue.getTokenDetails(tokenIdOwner2)
            tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
          }
        } else {
          while (tokenDetailsInvestor2[4] > 0) {
            if (tokenDetailsOwner[2] > 1) {
              await expectEvent(receipt, 'LevelUp', {
                tokenId: tokenIdOwner,
                level: tokenDetailsOwner[2],
              })
              await expectRevert(
                ue.fight(tokenIdOwner, tokenIdInvestor, {
                  from: owner,
                }),
                'Fight someone your own size!',
              )
            }
            receipt = await ue.fight(tokenIdOwner, tokenIdInvestor2, {
              from: owner,
            })
            await time.increase(61)
            tokenDetailsInvestor2 = await ue.getTokenDetails(tokenIdInvestor2)
            tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
          }
          while (tokenDetailsInvestor3[4] > 0) {
            if (tokenDetailsOwner[2] > 1) {
              await expectEvent(receipt, 'LevelUp', {
                tokenId: tokenIdOwner,
                level: tokenDetailsOwner[2],
              })
              await expectRevert(
                ue.fight(tokenIdOwner, tokenIdInvestor, {
                  from: owner,
                }),
                'Fight someone your own size!',
              )
            }
            receipt = await ue.fight(tokenIdOwner, tokenIdInvestor3, {
              from: owner,
            })
            await time.increase(61)
            tokenDetailsInvestor3 = await ue.getTokenDetails(tokenIdInvestor3)
            tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
          }
        }
      })

      it('REVERT: fight() dead one', async function () {
        await time.increase(61)
        let tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
        let tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
        while (tokenDetailsInvestor[4] > 0 && tokenDetailsOwner[4] > 0) {
          await ue.fight(tokenIdOwner, tokenIdInvestor, {
            from: owner,
          })
          await time.increase(61)
          tokenDetailsInvestor = await ue.getTokenDetails(tokenIdInvestor)
          tokenDetailsOwner = await ue.getTokenDetails(tokenIdOwner)
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
          gas: 3000000,
        })
        tokenIdInvestor = eventInvestor.logs[1].args[0].toString()
      })

      it('Resting', async function () {
        eventOwner = await ue.createCharacter(0, 0, {
          value: readable('0.001'),
          from: owner,
          gas: 3000000,
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

        expect(parseInt(tokenDetailsInvestorBefore[5])).to.be.lt(
          parseInt(tokenDetailsInvestorAfter[5]),
        )

        await expectEvent(receipt, 'Rested', { tokenId: tokenIdInvestor })
      })

      it('REVERT: rest() Not Owner', async function () {
        await expectRevert(
          ue.rest(tokenIdInvestor, { from: owner }),
          "You're not the owner of the NFT",
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
  })
})
