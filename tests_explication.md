## TESTS EXPLICATION

Dans les tests, nous simulons les différents cas d'utilisation du contrat UnlimitedEvolution.  

Pour les fonctions suivantes, nous vérifions si :
* Fonction UpdateFee
  - Le fee change
  - L'événement est émis
* Fonction UpdateLimitMint
  - Le changement de la limite du nombre de NFT mintable
  - L'événement est émis
* Fonction Withdraw
  - Le solde du propriétaire augmente
* Fonction Mint
  - Le nft est créé et le demandeur est le propriétaire.
  - L'événement est émis
* Fonction Combat
  - Pour les deux protagonistes, s'ils perdent des points de vie et gagnent de l'expérience
  - L'événement est émis
  - Le NFT augmente de niveau si les conditions sont remplis, puis l'événement est émis
* Fonction Repos
  - Les points d'endurance ont augmentés
  - L'événement est émis

**Tous les différents Reverts possibles sont également testés.**

***
***

In the tests, we simulate the different use cases of the contract UnlimitedEvolution.  

For the following functions, we check if :
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
  - The NFT increases in level if the conditions are met, then the event is issued
* Rest function
  - The stamina points have increased
  - The event is emitted

**All the different possible Reverts are also tested.**