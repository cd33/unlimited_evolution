// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

contract UnlimitedToken{

    mapping (address => uint) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;

    string public symbol;
    string public name;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    uint8 public tax;
    address public taxWallet;
    mapping (address => bool) public isAMMPair ;
    address public owner;
    address public gameContract;
    modifier onlyOwner{
        require(msg.sender==owner);
        _;
    }
    
    event Transfer (address indexed from, address indexed to, uint amount);
    event Approval (address indexed tokenOwner, address indexed spender, uint tokens);

    constructor(string memory _name,string memory _symbol,uint nbTokens){
        name=_name;
        symbol=_symbol;
        owner=msg.sender;
        firstMint(owner,nbTokens*10**decimals);
    }

    function firstMint(address receiver, uint amount) private {
        balanceOf[receiver] += amount;
        totalSupply += amount;
        
        emit Transfer(address(0), receiver, amount);
    }

    function levelUpMint(address receiver, uint amount) external {
        require(msg.sender==gameContract);
        
        balanceOf[receiver] += amount;
        totalSupply += amount;
        
        emit Transfer(address(0), receiver, amount);
    }
    

    // ERC-20 //

    function transfer(address receiver, uint amount) external {
        require(balanceOf[msg.sender]>=amount, "Insufficient balance.");
        
        transferWithoutTax(msg.sender,receiver,amount);
    }

    function approve(address spender, uint tokens) external returns (bool success) {
        allowance[msg.sender][spender] = tokens;
        
        emit Approval(msg.sender, spender, tokens);
        return true;
    }
    
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

    function transferWithoutTax(address from, address to, uint256 amount) private{
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(from, to, amount);
    }

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

    function setTax(uint8 _tax) external onlyOwner{
        require(_tax>=0 && _tax<=5,"tax must be between 0 and 5 %");
        tax=_tax;
    }

    function setTaxWallet(address _taxWallet) external onlyOwner{
        taxWallet=_taxWallet;
    }

    function setOwner(address _owner) external onlyOwner{
        owner=_owner;
    }

    function setAMMPair(address pair, bool taxed) external onlyOwner{
        isAMMPair[pair]=taxed;
    }
    
    function setGameContract(address _gameContract) external onlyOwner{
        gameContract=_gameContract;
    }
}
