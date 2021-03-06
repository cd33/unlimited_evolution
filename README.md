<img src="https://user-images.githubusercontent.com/8858434/150654537-85244510-278e-487f-92e5-6e883d39494c.png">

# Unlimited Evolution

Unlimited Evolution est un jeu P2E basé sur les NFTs.  
Les personnages sont des NFTs ERC-1155, que le joueur peut équiper avec différents objets (d'autres NFTs).  
Le jeu possède une monnaie (UnlimitedToken) qui permet d'acheter différents objets, être stakée et servira, sous conditions, dans la gouvernance des futures DAOs.  
Le but du jeu est de combattre d'autres joueurs et gagner des récompenses (UnlimitedToken ou du stuff).  
Chaque combat fait évoluer l'expérience du personnage jusqu'à monter d'un niveau, des stats sont alors à attribuer à votre personnages.  
Notre jeu contient une arène pour les combats, une interface pour l'équipement des perso, une market place primaire sur notre site, une market place secondaire sur [OpenSea](https://testnets.opensea.io/collection/unlimited-evolution), très prochainement une partie staking, ainsi que d'autres fonctionalités qui seront implémentés dans le futur (paris, open world, DAO, etc).  
<!-- Nous souhaitons proposer aux futurs joueurs de tester le jeu, en payant uniquement les fees, en leur 
prétant des personnages (pack personnage+équipement). En contre partie, ils ne peuvent gagner les récompenses. -->

## Les spécifications fonctionnelles du projet: 
* Création de personnages (NFT ERC-1155)
* Création d'une monnaie (ERC-20) et d'objets à équiper ou utiliser (ERC-1155)
* Interactions entre les NFTs (combat, utilisation et échange d'objets)
* Système de récompense en cas de victoire après un passage de niveau
* [Market place](https://testnets.opensea.io/collection/unlimited-evolution)
<!-- * Création d'un système de staking -->

**Pour plus de détails et connaitre l'état actuel du projet, consultez le fichier [v1.md](https://github.com/cd33/unlimited_evolution/blob/main/v1.md)**

## Installation et Exécution
### Installation:
* Télécharger [Node](https://nodejs.org/en/download/)
* Télécharger [Ganache](http://trufflesuite.com/ganache/)
* Télécharger [Git](https://git-scm.com/downloads)
* Télécharger [MetaMask](https://metamask.io/download.html)
```
git clone https://github.com/cd33/unlimited_evolution.git
cd unlimited_evolution
npm install -g truffle
npm install --global yarn
npm install
yarn add @chainlink/contracts
cd ./client
npm install
```
* Pour le déploiement, créer un fichier .env dans le dossier racine du projet.  
Il contiendra les paramètres de déploiement spécifiques et votre identifiant de projet Infura.
```
INFURA="Votre_infura_project_id"
MNEMONIC="Votre_seed" (Votre seed de 12 mots)
```
* Dans .client/App.js, changez le networkId avec le votre (ganache)
```
networkId !== 1337 //ex: 5777
```
* Modifier le fichier truffle-config.js si besoin.
### Execution:
* Lancer Ganache
```
cd unlimited_evolution
truffle migrate --network development --reset
cd client
npm start
```

## Tests:
```
truffle test ./test/UnlimitedEvolution.test.js --network development
```

## Docs:
Le [README des contrats](https://github.com/cd33/unlimited_evolution/blob/main/contracts/README.md) contient la documention concernant les contrats, généré à l’aide des NatSpec et Remix.

## Deploiement:
[Github-Pages](https://cd33.github.io/unlimited_evolution/)  
[Heroku](https://unlimited-evolution.herokuapp.com/)
* Configurer votre metamask, en ajoutant un nouveau réseau:
```
Nom du réseau: MUMBAI
Nouvelle URL de RPC: https://matic-mumbai.chainstacklabs.com
ID de chaîne: 80001
Currency Symbol: MATIC
```


***
***
***

# Unlimited Evolution

Unlimited Evolution is a P2E game based on NFTs.  
The characters are NFTs ERC-1155, which the player can equip with different items (from other NFTs).  
The game has a currency (UnlimitedToken) which can be used to buy different items, be staked and will be used, under conditions, in the governance of future DAOs.  
The goal of the game is to fight other players and win rewards (UnlimitedToken or stuff).  
Each fight increases the character's experience to a higher level, and stats are then assigned to your character.  
Our game contains an arena for fights, an interface for the equipment of the characters, a primary market place, a secondary market place with [OpenSea](https://testnets.opensea.io/collection/unlimited-evolution), really soon a staking part, also other functionalities which will be implemented in the future (bets, open world, DAO, etc).  
<!-- We want to offer future players to test the game, paying only the fees, by lending them 
by loaning them characters (character pack + equipment). In return, they cannot win the rewards -->

## The functional specifications of the project: 
* Character creation (NFT ERC-1155)
* Creation of a currency (ERC-20) and items to equip or use (ERC-1155)
* Interaction between NFTs (combat, use and exchange of items)
* Reward system for victory after a level up
* [Market place](https://testnets.opensea.io/collection/unlimited-evolution)
<!-- * Creation of a staking system -->

**For more details and the current status of the project, see the file [v1.md](https://github.com/cd33/unlimited_evolution/blob/main/v1.md)**

## Installation and Execution
### Installation:
* Download [Node](https://nodejs.org/en/download/)
* Download [Ganache](http://trufflesuite.com/ganache/)
* Download [Git](https://git-scm.com/downloads)
* Download [MetaMask](https://metamask.io/download.html)
```
git clone https://github.com/cd33/unlimited_evolution.git
cd unlimited_evolution
npm install -g truffle
npm install --global yarn
npm install
yarn add @chainlink/contracts
cd ./client
npm install
```
* For deployment, create an .env file in the project root folder.  
It will contain the specific deployment settings and your Infura project ID.
```
INFURA="Your_infura_project_id"
MNEMONIC="Your_seed" (Your 12 word seed)
```
* In .client/App.js, change the networkId to yours (ganache)
```
networkId !== 1337 //ex: 5777
```
* Modify the truffle-config.js file if necessary.
### Execute:
* Run Ganache
```
cd unlimited_evolution
truffle migrate --network development --reset
cd client
npm start
```

## Tests:
```
truffle test ./test/UnlimitedEvolution.test.js --network development
```

## Docs:
The [README of contracts](https://github.com/cd33/unlimited_evolution/blob/main/contracts/README.md) contains the documentation for the contracts, generated using NatSpec and Remix.

## Deployment:
[Github-Pages](https://cd33.github.io/unlimited_evolution/)  
[Heroku](https://unlimited-evolution.herokuapp.com/)
* Configure your metamask, adding a new network:
```
Network Name: MUMBAI
New RPC URL: https://matic-mumbai.chainstacklabs.com
ChainID: 80001
Symbol: MATIC
```