const { expect } = require('chai')

const UnlimitedEvolution = artifacts.require('UnlimitedEvolution')
const UnlimitedToken = artifacts.require('UnlimitedToken')
const RandomNumberGenerator = artifacts.require('RandomNumberGenerator')

contract('UnlimitedToken', function (accounts) {
  let ue, ut, rng
  const owner = accounts[0]

  describe('UT Tests', async () => {
    beforeEach(async function () {
      rng = await RandomNumberGenerator.new({
        from: owner,
      })
      ut = await UnlimitedToken.new({
        from: owner,
      })
      ue = await UnlimitedEvolution.new(ut.address, rng.address, { from: owner })
      await ut.setGameContract(ue.address)
      await rng.setUnlimitedAddress(ue.address)
      await ue.testModeSwitch()
    })

    it('a un nom', async function () {
      expect(await ut.name()).to.equal('Unlimited Token')
    })

    it('a un symbole', async function () {
      expect(await ut.symbol()).to.equal('ULT')
    })

    it('a une valeur décimal', async function () {
      expect(parseInt(await ut.decimals())).to.equal(18)
    })

    it('Total Supply et BalanceOf SC', async function () {
      expect(parseInt(await ut.totalSupply())).to.equal(21 * 10 ** 24)
      expect(parseInt(await ut.balanceOf(ut.address))).to.equal(21 * 10 ** 24)
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
      expect(unlimitedTokenVariableBefore).to.not.equal(
        unlimitedTokenVariableAfter,
      )
    })
  })
})
