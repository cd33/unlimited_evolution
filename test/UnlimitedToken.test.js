const {
  expectRevert,
  expectEvent,
  time,
} = require('@openzeppelin/test-helpers')
const { expect } = require('chai')

const UnlimitedEvolution = artifacts.require('UnlimitedEvolution')
const UnlimitedToken = artifacts.require('UnlimitedToken')

const readable = (val) => web3.utils.toWei(val, 'ether')

contract('UnlimitedToken', function (accounts) {
  let ue, ut
  const owner = accounts[0]
  const investor = accounts[1]

  describe('UT Tests', async () => {
    beforeEach(async function () {
      ut = await UnlimitedToken.new({
        from: owner,
      })
      ue = await UnlimitedEvolution.new(ut.address, { from: owner })
      await ut.setGameContract(ue.address)
      await ue.testModeSwitch()
    })

    describe('Unlimited Token', async () => {
      it('a un nom', async function () {
        expect(await ut.name()).to.equal('Unlimited Token')
      })

      it('a un symbole', async function () {
        expect(await ut.symbol()).to.equal('ULT')
      })

      it('a une valeur décimal', async function () {
        expect(parseInt(await ut.decimals())).to.equal(18)
      })

      it('Public variable each contract', async function () {
        let unlimitedTokenVariable = await ue.unlimitedToken()
        expect(unlimitedTokenVariable).to.equal(ut.address)

        let gameContract = await ut.gameContract()
        expect(gameContract).to.equal(ue.address)
      })

      it('SetTokenAddress', async function () {
        let unlimitedTokenVariableBefore = await ue.unlimitedToken()
        await ue.setTokenAddress(ue.address)
        unlimitedTokenVariableAfter = await ue.unlimitedToken()
        expect(unlimitedTokenVariableBefore).to.not.equal(unlimitedTokenVariableAfter)
      })


    })
  })
})
