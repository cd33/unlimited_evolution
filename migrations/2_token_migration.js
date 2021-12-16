const UnlimitedEvolution = artifacts.require("UnlimitedEvolution");

module.exports = async function (deployer) {
  await deployer.deploy(UnlimitedEvolution);
  // let tokenInstance = await Token.deployed();
  // await tokenInstance.createCaracter();
  // console.log(await tokenInstance.getCaracterDetails(0));
};
