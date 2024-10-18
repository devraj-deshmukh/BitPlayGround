const Web3 = require('web3');
const { abi, evm } = require('./build/contracts/GameToken.json'); // Adjust the path if needed
const HDWalletProvider = require('@truffle/hdwallet-provider');
const provider = new HDWalletProvider('YOUR_MNEMONIC', 'http://127.0.0.1:8545'); // Adjust the provider as necessary
const web3 = new Web3(provider);

const CONTRACT_ADDRESS = '0xf89d6bcf636449ac07fd5bcef224debe31bf39bd'; // Replace with your deployed contract address

const mintTokens = async (walletAddress, amount) => {
    const accounts = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi, CONTRACT_ADDRESS);

    // Call the rewardPlayer function
    await contract.methods.rewardPlayer(walletAddress, amount).send({ from: accounts[0] });
    console.log(`Minted ${amount} tokens for ${walletAddress}`);
};

const main = async () => {
    const walletAddresses = [
        '0x63f789A9fA4F0b51235286Ad1c7aeB3014c3e725' // Replace with actual addresses
        // Add more addresses as needed
    ];
    const amountToMint = web3.utils.toWei('100', 'ether'); // Adjust the amount based on your token's decimals

    for (let address of walletAddresses) {
        await mintTokens(address, amountToMint);
        console.log('minted ${amountToMint} for $address')
    }

    provider.engine.stop(); // Stop the provider after execution
};

main().catch((err) => {
    console.error(err);
    provider.engine.stop();
});
