const RandomNumberGenerator = artifacts.require("RandomNumberGenerator");
const UnlimitedToken = artifacts.require("UnlimitedToken");
const UnlimitedEvolution = artifacts.require("UnlimitedEvolution");

module.exports = async function (deployer) {
  await deployer.deploy(RandomNumberGenerator);
  await deployer.deploy(UnlimitedToken);
  const unlimitedToken = await UnlimitedToken.deployed();
  await deployer.deploy(UnlimitedEvolution, unlimitedToken.address);
  const unlimitedEvolution = await UnlimitedEvolution.deployed();
  unlimitedToken.setGameContract(unlimitedEvolution.address)

  // TESTS GANACHE
  // await unlimitedEvolution.testModeSwitch();
};
