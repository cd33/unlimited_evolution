## TESTS EXPLICATION

In the tests, I simulate the different use cases of the contract UnlimitedEvolution.  

For the following functions, I check if :
* UpdateFees function
  - The fees change
  - The event is emitted
* Withdraw function
  - The balance of the owner increases
* Mint function
  - The nft is created and the requester is the owner
  - The event is emitted
* Fight function
  - For the both protagonists, if they lose health points and gain experience
  - The event is emitted
* Spell function
  - For the both protagonists, if they lose health points, lose mana and gain experience 
  - The event is emitted
* Heal function
  - The life points have increased
  - The event is emitted

**All the different possible Reverts are also tested.**