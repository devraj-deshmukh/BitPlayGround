const GameToken = artifacts.require("GameToken");

module.exports = function(deployer) {
const tokenName = 'Yugen';
  const tokenSymbol = 'YUG';
  const totalSupply = '1000000000000000000000'; 
  deployer.deploy(GameToken, tokenName, tokenSymbol, totalSupply);
};
