# unlimited_evolution

Unlimited Evolution est un jeu P2E basé sur les NFTs.  
Les personnages sont des NFTs ERC-1155, que le joueur peut équiper avec différents objets (d'autres NFTs).  
Le jeu possède une monnaie (le noNameToken) qui permet d'acheter différents objets, être stakée et servira, sous conditions, dans la gouvernance des futures DAOs.  
Le but du jeu est de combattre d'autres joueurs et gagner des récompenses (noNameToken ou des objets).  
Chaque combat fait évoluer l'expérience du personnage jusqu'à monter d'un niveau, des stats sont alors à attribuer à votre personnages.  
Notre jeu contient une arène pour les combats, une interface pour l'équipement des perso, une partie staking, une market place (lien vers celle-ci) ainsi que d'autres fonctionalités qui seront implémentés dans le futur (paris, open world, DAO, etc).  
<!-- Nous souhaitons proposer aux futurs joueurs de tester le jeu, en payant uniquement les fees, en leur 
prétant des perso (pack perso+équipement). En contre partie, ils ne peuvent gagner les récompenses -->

## Les spécifications fonctionnelles du projet: 
* Création de personnages (NFT ERC-1155)
* Création d'une monnaie et d'objets à équiper ou utiliser (ERC-1155)
* Interactions entre les NFTs (combat, utilisation et échange d'objets)
* Système de récompense en cas de victoire après un combat
* Création d'un système de staking
* Implémentation d'une market place

## Installation et Exécution
### Installation:
* Télécharger [Node](https://nodejs.org/en/download/)
* Télécharger [Ganache](http://trufflesuite.com/ganache/)
* Télécharger [Git](https://git-scm.com/downloads)
```
git clone https://github.com/cd33/unlimited_evolution.git
cd unlimited_evolution
npm install -g truffle
npm install
cd ./client
npm install
```
* Pour le déploiement, créer un fichier .env dans le dossier racine du projet.  
Il stockera les paramètres de déploiement spécifiques et votre identifiant de projet Infura.
```
INFURA="Votre_infura_project_id"
MNEMONIC="Votre_seed" (Votre seed de 12 mots)
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
Le dossier ./docs contient la documention concernant les contrats, généré à l’aide des NatSpec et solidity-docgen.

## Deploiement:
[Github-Pages](https://cd33.github.io/unlimited_evolution/)  
[Heroku](https://unlimited-evolution.herokuapp.com/)