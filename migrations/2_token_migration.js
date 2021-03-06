const RandomNumberGenerator = artifacts.require("RandomNumberGenerator");
const UnlimitedToken = artifacts.require("UnlimitedToken");
const UnlimitedEvolution = artifacts.require("UnlimitedEvolution");

module.exports = async function (deployer) {
  await deployer.deploy(RandomNumberGenerator);
  const randomNumberGenerator = await RandomNumberGenerator.deployed();
  await deployer.deploy(UnlimitedToken);
  const unlimitedToken = await UnlimitedToken.deployed();
  await deployer.deploy(UnlimitedEvolution, unlimitedToken.address, randomNumberGenerator.address);
  const unlimitedEvolution = await UnlimitedEvolution.deployed();
  await unlimitedToken.setGameContract(unlimitedEvolution.address);
  await randomNumberGenerator.setUnlimitedAddress(unlimitedEvolution.address);

  // TESTS GANACHE
  // await unlimitedEvolution.testModeSwitch();
};
