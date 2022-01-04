const RandomNumberGenerator = artifacts.require("RandomNumberGenerator");
const UnlimitedEvolution = artifacts.require("UnlimitedEvolution");

module.exports = async function (deployer) {
  await deployer.deploy(RandomNumberGenerator);
  await deployer.deploy(UnlimitedEvolution);

  // TESTS GANACHE
  // const ue = await UnlimitedEvolution.deployed();
  // await ue.testModeSwitch();
};
