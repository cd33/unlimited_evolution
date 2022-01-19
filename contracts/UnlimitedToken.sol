// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.7;
import "@openzeppelin/contracts/access/Ownable.sol";

/** @title Unlimited Token */
contract UnlimitedToken is Ownable {

    /**
     * @dev ERC20 parameters
     */
    mapping (address => uint) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;

    string public name = "Unlimited Token";
    string public symbol = "ULT";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    uint mintNumber;

    /**
     * @dev Custom parameters to have a tax in swaps 
     */
    uint8 public tax;
    address public taxWallet;
    mapping (address => bool) public isAMMPair;

    /**
     * @dev The only address allowed to mint tokens (on level up)
     */
    address public gameContract;

    /**
     * @dev Emitted when a token transfer happens
     */
    event Transfer (address indexed from, address indexed to, uint amount);

    /**
     * @dev Emitted when an approval happens
     */
    event Approval (address indexed tokenOwner, address indexed spender, uint tokens);

    /**
     * @dev Constructor of the ERC20, first mint of 21M to token deployer
     */
    constructor(){
        firstMint(address(this), 21*10**6*10**decimals);
    }

     /**
     * @dev The function to mint the first tokens of deployment
     * @param receiver Address to receive the mint
     * @param amount The quantity of token to mint
     */
    function firstMint(address receiver, uint amount) private {
        balanceOf[receiver] = amount;
        totalSupply = amount;
        
        emit Transfer(address(0), receiver, amount);
    }

    /**
     * @dev When a level up happens in game contract, a mint is triggered
     * @param receiver Address to receive the mint
     */
    function levelUpMint(address receiver) external {
        require(msg.sender==gameContract);
        
        uint amount=10000/2**(mintNumber/100); //totalMint : 2M
        mintNumber++;

        transfer(address(this),amount*10**18);
        
        emit Transfer(address(this), msg.sender, amount);
    }

    // ERC-20 //

    /**
     * @dev Transfer tokens to an address
     * @param receiver Address to receive the tokens
     * @param amount The quantity of token to send
     */
    function transfer(address receiver, uint amount) public {
        require(balanceOf[msg.sender]>=amount, "Insufficient balance.");
        
        transferWithoutTax(msg.sender,receiver,amount);
    }

    /**
     * @dev Allow an address to spend the tokens
     * @param spender The address allowed to spend tokens
     * @param tokens How many tokens the address can spend
     */
    function approve(address spender, uint tokens) external returns (bool success) {
        allowance[msg.sender][spender] = tokens;
        
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
    
    /**
     * @dev Transfer from an address to another if allowed
     * @param from The origin of the tokens
     * @param to The destination of the tokens
     * @param amount The amount of tokens to move
     */
    function transferFrom(address from, address to, uint256 amount) external returns (bool success) {
        require(allowance[from][msg.sender]>= amount, "You aren't allowed to spend this amount");
        require(balanceOf[from]>=amount, "Insufficient balance");
        
        allowance[from][msg.sender] -= amount;
        
        if (tax==0){
            transferWithoutTax(from,to,amount);
        }
        else{
            if (isAMMPair[from] || isAMMPair[to]){
                transferWithTax(from,to,amount);
            }
            else{
                transferWithoutTax(from,to,amount);
            }
        }
        return true;
    }

    /**
     * @dev Transfer from an address to another if allowed, without any tax
     * @param from The origin of the tokens
     * @param to The destination of the tokens
     * @param amount The amount of tokens to move
     */
    function transferWithoutTax(address from, address to, uint256 amount) private{
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(from, to, amount);
    }

    /**
     * @dev Transfer from an address to another if allowed, with a tax if from/to an AMM pair
     * @param from The origin of the tokens
     * @param to The destination of the tokens
     * @param amount The amount of tokens to move
     */
    function transferWithTax(address from, address to, uint256 amount) private{
        uint taxed=amount*tax/100;
        uint notTaxed=amount-taxed;
        
        balanceOf[from] -= amount;
        balanceOf[taxWallet] += taxed;
        balanceOf[to] += notTaxed;
        
        emit Transfer(from, to, notTaxed);
        emit Transfer(from, taxWallet, taxed);
    }
    
    // Owner parameters //

    /**
     * @dev The tax in % taken in each buy or sell
     * @param _tax The new tax in %, from 0 to 5 allowed
     */
    function setTax(uint8 _tax) external onlyOwner{
        require(_tax>=0 && _tax<=5,"tax must be between 0 and 5 %");
        tax=_tax;
    }

    /**
     * @dev The wallet that will receive the tax
     * @param _taxWallet The address of the new wallet 
     */
    function setTaxWallet(address _taxWallet) external onlyOwner{
        taxWallet=_taxWallet;
    }

    /**
     * @dev Define an address as an AMM pair to tax it
     * @param pair Define the address of the AMM pair
     * @param taxed Define if this address should be taxed or not
     */
    function setAMMPair(address pair, bool taxed) external onlyOwner{
        isAMMPair[pair]=taxed;
    }
    
    /**
     * @dev Define the main contract of the game
     * @param _gameContract The new contract of the game if any update in the futur
     */
    function setGameContract(address _gameContract) external onlyOwner{
        gameContract=_gameContract;
    }
}
