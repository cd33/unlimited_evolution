## TESTS EXPLICATION

Dans les tests, nous simulons les différents cas d'utilisation du contrat UnlimitedEvolution  

Pour les fonctions suivantes, nous vérifions si :
* Fonction UpdateMintFee
  - Le fee change
  - L'événement est émis
* Fonction UpdateStuffFee
  - Le fee change
  - L'événement est émis
* Fonction UpdateLimitMint
  - Le changement de la limite du nombre de NFT mintable
  - L'événement est émis
* Fonction Withdraw
  - Le solde du propriétaire augmente
* Fonction Mint
  - Le NFT Character et les NFTs Stuff sont créés et le demandeur en est le propriétaire
  - L'événement est émis
* Fonction Fight
  - Pour les deux protagonistes, s'ils perdent des points de vie et gagnent de l'expérience
  - L'événement est émis
  - Si les conditions sont remplies, le NFT augmente de niveau et le propriétaire recoit ses récompenses, l'événement est émis.
* Fonction Rest
  - Les points de vie et d'endurance ont augmentés
  - Le timestamp du dernier block est assigné à la variable lastRest
  - L'événement est émis
* Le Construteur
  - Les différents NFT Stuff sont mintés et que le smart contrat les possède
* Fonction CreateStuff
  - Le nouveau NFT Stuff est minté et que ses statistiques bonus sont bien celles attendues
* Fonction ManageStuff
  - Le NFT Stuff modifié est minté et que ses nouvelles valeurs lui sont attribuées
  - L'ajout de potion fonctionne
  - Elle est capable de créer un nouveau NFT Stuff à l'instar de CreateStuff
* Fonction BuyStuff
  - Le NFT Stuff est acheté puis transféré au demandeur
  - L'événement est émis
* Fonction EquipStuff
  - Le NFT Stuff est référencé dans le champ weapon ou shield du Character et ses stats d'attaques/defenses changent
  - L'événement est émis
* Fonction UsePotion
  - Le NFT Potion est burn puis les champs hp et stamina du Character ont augmentés
  - L'événement est émis

**Tous les différents Reverts possibles sont également testés**

***
***

In the tests, we simulate the different use cases of the contract UnlimitedEvolution  

For the following functions, we check if :
* UpdateFee function
  - The fee change
  - The event is emitted
* UpdateStuffFee function
  - The fee changes
  - The event is emitted
* Function UpdateLimitMint
  - The limit of NFT mintable changes
  - The event is emitted
* Withdraw function
  - The owner's balance increases
* Mint function
  - The NFT Character and NFTs Stuff are created and the requester is the owner
  - The event is emitted
* Fight function
  - For both protagonists, if they lose health points and gain experience
  - The event is emitted
  - The NFT increases in level if the conditions are met, then the event is emitted
* Rest function
  - Life and stamina points have increased
  - The event is emitted
* The Constructor
  - The different NFT Stuff are minted and the smart contract own them
* CreateStuff function
  - The new NFT Stuff is minted and its bonus statistics are as expected
* ManageStuff function
  - The modified NFT Stuff is minted and assigned its new values
  - The potion addition works
  - It is able to create a new NFT Stuff like CreateStuff
* BuyStuff function
  - The NFT Stuff is bought and transferred to the requester
  - The event is emitted
* Function EquipStuff
  - The NFT Stuff is equipped with its Character (referenced in the weapon or shield field of the Character)
  - The event is emitted
* UsePotion function
  - The NFT Potion is burned and then the Character's hp and stamina fields are increased
  - The event is emitted

**All the different possible Reverts are also tested**