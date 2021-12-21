## TESTS EXPLICATION

In the tests, I simulate the different use cases of the contract UnlimitedEvolution.  

For the following functions, I check if :
* UpdateFee function
  - The fee change
  - The event is emitted
* UpdateLimitMint function
  - The limit of nft mintable change
  - The event is emitted
* Withdraw function
  - The balance of the owner increases
* Mint function
  - The nft is created and the requester is the owner
  - The event is emitted
* Fight function
  - For the both protagonists, if they lose health points and gain experience
  - The event is emitted
* Rest function
  - The stamina points have increased
  - The event is emitted

**All the different possible Reverts are also tested.**