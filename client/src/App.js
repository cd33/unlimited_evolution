import React, { useState, useEffect } from "react";
import UnlimitedEvolution from "./contracts/UnlimitedEvolution.json";
import getWeb3 from "./getWeb3";
import * as s from "./globalStyles";
import Navbar from "./components/Navbar";
import Modal from "./components/Modal";
import CharacterRenderer from "./components/CharacterRenderer";

const App = () => {

  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [owner, setOwner] = useState(null);
  const [ueContract, SetUeContract] = useState(null);
  const [characters, setCharacters] = useState(null);
  const [typeCharacter, setTypeCharacter] = useState(0);
  const [genderCharacter, setGenderCharacter] = useState(0);
  const [othersCharacters, setOthersCharacters] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [titleModal, setTitleModal] = useState(false);
  const [contentModal, setContentModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        web3.eth.handleRevert = true;

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        if (window.ethereum) {
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccounts({ accounts });
            window.location.reload();
          });

          window.ethereum.on('chainChanged', (_chainId) => window.location.reload());
        }

        const networkId = await web3.eth.net.getId();
        if (networkId !== 1337 && networkId !== 42) {
          handleModal("Wrong Network", "Please Switch to the Kovan Network");
          return;
        }

        // Load UnlimitedEvolution and the NFTs
        const ueNetwork = UnlimitedEvolution.networks[networkId];
        const ueContract = new web3.eth.Contract(UnlimitedEvolution.abi, ueNetwork && ueNetwork.address);
        SetUeContract(ueContract);
        await ueContract.methods.getMyCharacters().call({ from: accounts[0] }).then(res => setCharacters(res));
        await ueContract.methods.getOthersCharacters().call({ from: accounts[0] }).then(res => setOthersCharacters(res));

        setOwner(accounts[0] === await ueContract.methods.owner().call());

        // Subscribe to the contract states to update the front states
        web3.eth.subscribe('newBlockHeaders', async (err, res) => {
          if (!err) {
            await ueContract.methods.getMyCharacters().call({ from: accounts[0] }).then(res => setCharacters(res));
            await ueContract.methods.getOthersCharacters().call({ from: accounts[0] }).then(res => setOthersCharacters(res));
          }
        });

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setWeb3(web3);
        setAccounts(accounts);
      } catch (error) {
        // Catch any errors for any of the above operations.
        handleModal("Error", `Failed to load web3, accounts, or contract. Check console for details.`);
        console.error(error);
      }
    };
    init();
  }, []);

  // EVENTS
  useEffect(() => {
    if (ueContract !== null && web3 !== null && accounts !== null) {
      ueContract.events.CharacterCreated()
      .on('data', event => handleModal(`Character Created ID #${event.returnValues.id}`,
      "Your caracter has just woken up and needs a one minute rest before interacting with other NFTs"))
      .on('error', err => handleModal("Error", err.message))

      ueContract.events.Rested()
      .on('data', event => handleModal("Your Character Is Rested", `Your character #${event.returnValues.tokenId} was rested of 50 points`))
      .on('error', err => handleModal("Error", err.message))

      ueContract.events.Fighted()
      .on('data', event => handleModal("The Fight Took Place", `Your character #${event.returnValues.myTokenId} fought with #${event.returnValues.rivalTokenId}. 
        You inflicted ${event.returnValues.substrateLifeToRival} hp and you suffered ${event.returnValues.substrateLifeToMe} hp.`))
      .on('error', err => handleModal("Error", err.message))

      ueContract.events.LevelUp()
      .on('data', event => handleModal("Congratulations !", `Your character #${event.returnValues.tokenId} is now level #${event.returnValues.level}.`))
      .on('error', err => handleModal("Error", err.message))
    }
  }, [accounts, ueContract, web3])
    
  const createCharacter = () => {
    setLoading(true);
    ueContract.methods.createCharacter(typeCharacter, genderCharacter)
      .send({ from: accounts[0], value: web3.utils.toWei("0.001", 'Ether') })
      .once("error", err => {
        setLoading(false);
        console.log(err);
      })
      .then(receipt => {
        setLoading(false);
        console.log(receipt);
      })
  }

  const withdraw = () => {
    setLoading(true);
    ueContract.methods.withdraw().send({ from: accounts[0] })
      .once("error", err => {
        setLoading(false);
        console.log(err);
      })
      .then(res => {
        setLoading(false);
        console.log(res);
      })
  }

  const fight = (_myTokenId, _rivalTokenId) => {
    setLoading(true);
    ueContract.methods.fight(_myTokenId, _rivalTokenId)
      .send({ from: accounts[0] })
      .once("error", err => {
        setLoading(false);
        console.log(err);
      })
      .then(res => {
        setLoading(false);
        console.log(res);
      })
  }

  const rest = (_myTokenId) => {
    setLoading(true);
    ueContract.methods.rest(_myTokenId)
      .send({ from: accounts[0] })
      .once("error", err => {
        setLoading(false);
        console.log(err);
      })
      .then(res => {
        setLoading(false);
        console.log(res);
      })
  }

  const typeCharacterName = (val) => {
    if (parseInt(val) === 0) {
      return "BRUTE";
    } else if (parseInt(val) === 1) {
      return "SPIRITUAL";
    } else {
      return "ELEMENTARY";
    }
  }

  const typeGenderName = (val) => {
    if (parseInt(val) === 0) {
      return "MASCULINE";
    } else if (parseInt(val) === 1) {
      return "FEMININE";
    } else {
      return "OTHER";
    }
  }

  const handleModal = (title, content) => {
    setTitleModal(title);
    setContentModal(content);
    setModalShow(true);
  }

  const handleSelectedCharacter = (e) => {
    if (e === "") return null;
    // let tempArray = {id: null, mana: null};
    let tempArray = {id: null};
    let character = JSON.parse(e);
    tempArray.id = character.id;
    // tempArray.mana = character.mana;
    setSelectedCharacter(tempArray);
  }

  const attacks = (type, nb) => {
    const attacksType = {
      brute: ["Speed", "Power", "Resistance", "Weapons"],
      spiritual: ["Gravitation", "Electromagnetism", "Magic", "Invocation"],
      elementary: ["Air", "Water", "Earth", "Fire"]
    };
    if(type === "0") return (attacksType.brute[nb])
    if(type === "1") return (attacksType.spiritual[nb])
    if(type === "2") return (attacksType.elementary[nb])
  }
  

  return (
    <s.Screen>
      <s.Container ai="center" style={{ flex: 1, backgroundColor: '#DBAD6A' }}>
        {!web3 ?
          <><s.TextTitle>Loading Web3, accounts, and contract...</s.TextTitle>
          <Modal modalShow={modalShow} setModalShow={setModalShow} title={titleModal} content={contentModal} /></>
          : <>
            <Navbar accounts={accounts} />

            <s.TextTitle>Unlimited Evolution</s.TextTitle>
            <s.TextSubTitle>Veuillez choisir un type de personnage</s.TextSubTitle>

            <div style={{ flexDirection: "row" }} >
              <select onChange={e => setTypeCharacter(e.target.value)}>
                <option value="0">BRUTE</option>
                <option value="1">SPIRITUAL</option>
                <option value="2">ELEMENTARY</option>
              </select>
              
              <select onChange={e => setGenderCharacter(e.target.value)}>
                <option value="0">MASCULINE</option>
                <option value="1">FEMININE</option>
                <option value="2">OTHER</option>
              </select>

              <s.Button
                disabled={loading ? 1 : 0}
                onClick={() => createCharacter()}
                primary={loading ? "" : "primary"}
              >
                CREATE CHARACTER
              </s.Button>
            </div>

            <s.TextTitle style={{ margin: 0 }}>Mes Persos</s.TextTitle>
            <s.SpacerSmall />
            {!characters && <s.TextSubTitle>Créez votre premier NFT</s.TextSubTitle>}

            <s.Container fd="row" jc="center" style={{ flexWrap: "wrap" }}>
              {characters && characters.length > 0 &&
                characters.map(character => {
                  return (
                    <div key={character.id}>
                      <s.Container ai="center" style={{ minWidth: "200px", margin:10 }}>
                        <CharacterRenderer character={character} />
                        <s.TextDescription>ID: {character.id}</s.TextDescription>
                        {/* <s.TextDescription>DNA: {character.dna}</s.TextDescription> */}
                        <s.TextDescription>Level: {character.level}</s.TextDescription>
                        <s.TextDescription>XP: {character.xp}</s.TextDescription>
                        <s.TextDescription>HP: {character.hp}</s.TextDescription>
                        <s.TextDescription>Stamina: {character.stamina}</s.TextDescription>
                        <s.TextDescription>Attack: {character.attack}</s.TextDescription>
                        <s.TextDescription>Armor: {character.armor}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 0)}: {character.attack1}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 1)}: {character.attack2}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 2)}: {character.attack3}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 3)}: {character.attack4}</s.TextDescription>
                        <s.TextDescription>Type: {typeCharacterName(character.typeCharacter)}</s.TextDescription>
                        <s.TextDescription>Type: {typeGenderName(character.genderCharacter)}</s.TextDescription>
                        {character.stamina < 100 &&
                          <s.Button
                            disabled={loading ? 1 : 0}
                            onClick={() => rest(character.id)}
                            primary={loading ? "" : "primary"}
                          >
                            REST
                          </s.Button>
                        }
                      </s.Container>
                      <s.SpacerSmall />
                    </div>
                  )
                })
              }
            </s.Container>

            <s.SpacerLarge />
            <s.TextTitle style={{ margin: 0 }}>Mes Ennemis</s.TextTitle>

            {characters && characters.length > 0 &&
              <><s.TextSubTitle>Veuillez choisir un personnage pour combattre</s.TextSubTitle>
                <select onChange={e => handleSelectedCharacter(e.target.value)}>
                  <option value="">--Please choose an option--</option>
                  {characters.map(character => (
                    // <option key={character.id} value={`{"id":${character.id},"mana":${character.mana}}`}>ID #{character.id}</option>
                    <option key={character.id} value={`{"id":${character.id}}`}>ID #{character.id}</option>
                  ))
                  }
                </select></>
            }

            <s.Container fd="row" jc="center" style={{ flexWrap: "wrap" }}>
              {othersCharacters && othersCharacters.length > 0 &&
                othersCharacters.map(character => {
                  return (
                    <div key={character.id}>
                      <s.Container ai="center" style={{ minWidth: "200px", margin:10 }}>
                        <CharacterRenderer character={character} />
                        <s.TextDescription>ID: {character.id}</s.TextDescription>
                        {/* <s.TextDescription>DNA: {character.dna}</s.TextDescription> */}
                        <s.TextDescription>Level: {character.level}</s.TextDescription>
                        <s.TextDescription>XP: {character.xp}</s.TextDescription>
                        <s.TextDescription>HP: {character.hp}</s.TextDescription>
                        <s.TextDescription>Stamina: {character.stamina}</s.TextDescription>
                        <s.TextDescription>Attack: {character.attack}</s.TextDescription>
                        <s.TextDescription>Armor: {character.armor}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 0)}: {character.attack1}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 1)}: {character.attack2}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 2)}: {character.attack3}</s.TextDescription>
                        <s.TextDescription>{attacks(character.typeCharacter, 3)}: {character.attack4}</s.TextDescription>
                        <s.TextDescription>Type: {typeCharacterName(character.typeCharacter)}</s.TextDescription>
                        <s.TextDescription>Type: {typeGenderName(character.genderCharacter)}</s.TextDescription>

                        {characters && characters.length > 0 && selectedCharacter &&
                          <s.Container fd="row" jc="center">
                            <s.Button
                              disabled={loading ? 1 : 0}
                              onClick={() => fight(selectedCharacter.id, character.id)}
                              primary={loading ? "" : "primary"}
                            >
                              FIGHT
                            </s.Button>
                          
                            {/* { selectedCharacter.mana >= 10 &&
                              <s.Button
                                disabled={loading ? 1 : 0}
                                onClick={() => spell(selectedCharacter.id, character.id)}
                                primary={loading ? "" : "primary"}
                              >
                                SPELL
                              </s.Button>
                            } */}
                          </s.Container>
                        }
                      </s.Container>
                      <s.SpacerSmall />
                    </div>
                  )
                })
              }
            </s.Container>
            <Modal modalShow={modalShow} setModalShow={setModalShow} title={titleModal} content={contentModal} />
          </>}
        {owner &&
          <s.Button
            disabled={loading ? 1 : 0}
            onClick={() => withdraw()}
            primary={loading ? "" : "primary"}
          >
            WITHDRAW
          </s.Button>
        }
      </s.Container>
    </s.Screen>
  )
}

export default App;
