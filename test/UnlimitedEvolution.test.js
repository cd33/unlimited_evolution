const { BN, expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const UnlimitedEvolution = artifacts.require('UnlimitedEvolution')

const readable = val => web3.utils.toWei(val, 'ether');
const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

contract('UnlimitedEvolution', function (accounts) {
  let ue
  const owner = accounts[0]
  const investor = accounts[1]

  describe('UE Tests', async () => {
    beforeEach(async function () {
      ue = await UnlimitedEvolution.new({ from: owner })
    })

    // it('a un nom', async function () {
    //   expect(await ue.name()).to.equal('UnlimitedEvolution')
    // })

    // it('a un symbole', async function () {
    //   expect(await ue.symbol()).to.equal('UEV')
    // })

    // it('Create a Caracter', async function () {
    //   let balance = await ue.balanceOf(investor)
    //   expect(balance).to.be.bignumber.equal('0')
    //   await ue.createCharacter(0, { value: readable('0.001'), from: investor })
    //   balance = await ue.balanceOf(investor)
    //   expect(balance).to.be.bignumber.equal('1')
    // })

    // it('REVERT: createCharacter() Wrong amount of fees', async function () {
    //   await expectRevert(
    //     ue.createCharacter(0, { value: readable('0.01'), from: investor }),
    //     'Wrong amount of fees',
    //   )
    // })

    // it('REVERT: createCharacter() more than 5 NFTs', async function () {
    //   await ue.createCharacter(0, {
    //     value: readable('0.001'),
    //     from: investor,
    //   })
    //   await ue.createCharacter(1, {
    //     value: readable('0.001'),
    //     from: investor,
    //   })
    //   await ue.createCharacter(2, {
    //     value: readable('0.001'),
    //     from: investor,
    //   })
    //   await ue.createCharacter(1, {
    //     value: readable('0.001'),
    //     from: investor,
    //   })
    //   await ue.createCharacter(0, {
    //     value: readable('0.001'),
    //     from: investor,
    //   })
    //   await expectRevert(
    //     ue.createCharacter(1, { value: readable('0.001'), from: investor }),
    //     "You can't have more than 5 NFT")
    // })

    // it('REVERT: createCharacter() non-existent class', async function () {
    //   await expectRevert.unspecified(
    //     ue.createCharacter(3, { value: readable('0.001'), from: investor }))
    // })
  })
})
