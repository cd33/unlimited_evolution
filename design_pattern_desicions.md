<h1>Décisions de modèle de conception</h1>

<p>Diverses décisions relatives aux modèles de conception ont été mises en œuvre et certaines ne l’ont pas été délibérément. Vous trouverez ci-dessous une description de chaque modèle de conception, un exemple de la façon dont il a été mis en œuvre dans les contrats et les avantages de l’avoir.

<h2>Access Restriction</h2>

<h3>Description</h3>

Restreindre l’accès à la fonctionnalité du contrat en fonction de critères appropriés. Les fonctions peuvent avoir un accès restreint selon qu’elles sont définies comme publiques ou utilisent des modificateurs dans le cas de fonctions.

<h3>Code</h3>

    UnlimitedEvolution.sol // function  rest(uint256 _tokenId) external {…....}

<h3>Avantages</h3>

Permet seulement au propriétaire du NFT de le faire combattre

<h2>Pull over Push</h2>

<h3>Description</h3>

Transférez le risque associé au transfert d’éther à l’utilisateur.

<h3>Code</h3>

A faire.

<h3>Avantages</h3>

Une fonction qui exige que les meilleurs retirent leurs propres prix au lieu d’avoir une seule fonction qui distribue tous les prix à chacun. C’est avantageux car cela permet d’économiser beaucoup de coûts de gaz pour ce contrat. En outre, cela réduit le risque que l’adresse de réception soit un contrat qui pourrait avoir une fonction de secours implémentée qui lève simplement une exception une fois qu’elle est appelée. Fondamentalement, un transfert échoué ne conduira pas à l’annulation de tous les autres transferts.

<h2>Guard Check</h2>

<h3>Description</h3>

Assurer que le comportement d’un contrat intelligent et ses paramètres d’entrée sont conformes aux attentes.

<h3>Code</h3>

    UnlimitedEvolution.sol // function  createCharacter (type_character _typeCharacter, gender_character _genderCharacter) external payable {…}

<h3>Avantages</h3>

Permet de vérifier que chaque utilisateur possède suffisamment de fond pour pouvoir minter et limiter chacun a minter maximum 5 NFT.

<h2>Emergency Stop</h2>

<h3>Description</h3>

Ajouter une option pour désactiver les fonctionnalités critiques du contrat en cas d’urgence.

<h3>Code</h3>

A faire.

<h3>Avantages</h3>

Une fonction d'un arrêt d’urgence sera mise en œuvre, qui peut être déclenché par le propriétaire du jeu. Il est là pour empêcher un combat qui est imparfait ou invalide. Cela garantira que les fonds du jeu ne sont pas perdus en cas de combat corrompu ou disqualifié qui peut survenir en raison d’un événement. L’utilisation de ce modèle de conception ici protège contre la perte de fonds et pour conserver la légitimité des combats en cas d’urgence qui pourrait ruiner l’équité d’un combat.

<h2>Oracle</h2>

<h3>Description</h3>

Génération de nombre aléatoire (DNA)

<h3>Code</h3>

    UnlimitedEvolution.sol // function _generateRandomNumber(uint256 _mod) internal {…}

<h3>Avantages</h3>

Dans l’écosystème Ethereum, les smart contracts sont malheureusement limités et dans de nombreux cas, le recours à une ressource off-chain est nécessaire. C’est notamment le cas dans lors de la génération d’un nombre aléatoire.

<h2>State Machine</h2>

<h3>Description</h3>

Permet à un contrat de se comporter comme une machine à états, ce qui signifie qu’ils ont certaines étapes dans lesquelles ils se comportent différemment ou dans lesquelles différentes fonctions peuvent être appelées. Un appel de fonction met souvent fin à une étape et fait passer le contrat à l’étape suivante.

<h3>Code</h3>

A faire

<h3>Avantages</h3>

Le contrat doit utiliser la variable State enum pour garder une trace de l’état dans lequel il se trouve actuellement. Les états sont nécessaires pour que la logique du contrat fonctionne correctement et pour que les combats et les paiements se produisent dans le bon ordre.

<h2>Secure Ether Transfer</h2>

<h3>Description</h3>

Transfert d’éther du Owner à l’utilisateur en toute sécurité.

<h3>Code</h3>

     UnlimitedEvolution.sol //function  withdraw() external  onlyOwner()



<h3>Avantage</h3>

Depuis son introduction, a généralement été recommandé par la communauté de la sécurité car il aide à se prémunir contre les attaques de réentrance.