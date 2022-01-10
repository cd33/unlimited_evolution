import React, { useState, useEffect } from 'react'
import UnlimitedEvolution from './contracts/UnlimitedEvolution.json'
import getWeb3 from './getWeb3'
import * as s from './globalStyles'
import Navbar from './components/Navbar'
import Modal from './components/Modal'
import CharacterRenderer from './components/CharacterRenderer'

const App = () => {
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [owner, setOwner] = useState(null)
  const [ueContract, setUeContract] = useState(null)
  const [characters, setCharacters] = useState(null)
  const [typeCharacter, setTypeCharacter] = useState(0)
  const [genderCharacter, setGenderCharacter] = useState(0)
  const [othersCharacters, setOthersCharacters] = useState(null)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalShow, setModalShow] = useState(false)
  const [titleModal, setTitleModal] = useState(false)
  const [contentModal, setContentModal] = useState(false)
  const [countAttributesAttack1, setCountAttributesAttack1] = useState(0)
  // const [countAttributesAttack2, setCountAttributesAttack2] = useState(0);
  // const [countAttributesAttack3, setCountAttributesAttack3] = useState(0);
  // const [countAttributesAttack4, setCountAttributesAttack4] = useState(0);
  const [stuffs, setStuffs] = useState(null)
  const [typeBuyStuff, setTypeBuyStuff] = useState(1)
  const [typeEquipStuff, setTypeEquipStuff] = useState(0)
  const [typeEquipChar, setTypeEquipChar] = useState(0)
  const [balancePotion, setBalancePotion] = useState()

  useEffect(() => {
    const init = async () => {
      try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3()
        web3.eth.handleRevert = true

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts()

        if (window.ethereum) {
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccounts({ accounts })
            window.location.reload()
          })

          window.ethereum.on('chainChanged', (_chainId) =>
            window.location.reload(),
          )
        }

        const networkId = await web3.eth.net.getId()
        if (networkId !== 1337 && networkId !== 42) {
          handleModal('Wrong Network', 'Please Switch to the Kovan Network')
          return
        }

        // Load UnlimitedEvolution and the NFTs
        const ueNetwork = UnlimitedEvolution.networks[networkId]
        const ueContract = new web3.eth.Contract(
          UnlimitedEvolution.abi,
          ueNetwork && ueNetwork.address,
        )
        setUeContract(ueContract)
        await ueContract.methods
          .getMyCharacters()
          .call({ from: accounts[0] })
          .then((res) => setCharacters(res))
        await ueContract.methods
          .getOthersCharacters()
          .call({ from: accounts[0] })
          .then((res) => setOthersCharacters(res))
        await ueContract.methods
          .getMyStuffs()
          .call({ from: accounts[0] })
          .then((res) => setStuffs(res))
        await ueContract.methods
          .getBalanceStuff(5)
          .call({ from: accounts[0] })
          .then((res) => setBalancePotion(res))

        setOwner(accounts[0] === (await ueContract.methods.owner().call()))

        console.log(await web3.eth.getBlockNumber())

        // Subscribe to the contract states to update the front states
        web3.eth.subscribe('newBlockHeaders', async (err, res) => {
          if (!err) {
            await ueContract.methods
              .getMyCharacters()
              .call({ from: accounts[0] })
              .then((res) => setCharacters(res))
            await ueContract.methods
              .getOthersCharacters()
              .call({ from: accounts[0] })
              .then((res) => setOthersCharacters(res))
            await ueContract.methods
              .getMyStuffs()
              .call({ from: accounts[0] })
              .then((res) => setStuffs(res))
            await ueContract.methods
              .getBalanceStuff(5)
              .call({ from: accounts[0] })
              .then((res) => setBalancePotion(res))
          }
        })

        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        setWeb3(web3)
        setAccounts(accounts)
      } catch (error) {
        // Catch any errors for any of the above operations.
        handleModal(
          'Error',
          `Failed to load web3, accounts, or contract. Check console for details.`,
        )
        console.error(error)
      }
    }
    init()
  }, [])

  // EVENTS
  useEffect(() => {
    if (ueContract !== null && web3 !== null && accounts !== null) {
      ueContract.events
        .CharacterCreated()
        .on('data', (event) =>
          handleModal(
            `Character Created ID #${event.returnValues.id}`,
            'Your caracter is ready, you can interacting with other NFTs',
          ),
        )
        .on('error', (err) => handleModal('Error', err.message))

      ueContract.events
        .Rested()
        .on('data', (event) =>
          handleModal(
            'Your Character Is Rested',
            `Your character #${event.returnValues.tokenId} is resting, your character will be available in 24 hours with all his hp and stamina`,
          ),
        )
        .on('error', (err) => handleModal('Error', err.message))

      ueContract.events
        .Fighted()
        .on('data', (event) =>
          handleModal(
            'The Fight Took Place',
            `Your character #${event.returnValues.myTokenId} fought with #${event.returnValues.rivalTokenId}. 
        You inflicted ${event.returnValues.substrateLifeToRival} hp and you suffered ${event.returnValues.substrateLifeToMe} hp.`,
          ),
        )
        .on('error', (err) => handleModal('Error', err.message))

      ueContract.events
        .LevelUp()
        .on('data', (event) =>
          handleModal(
            'Congratulations !',
            `Your character #${event.returnValues.tokenId} is now level #${event.returnValues.level}.`,
          ),
        )
        .on('error', (err) => handleModal('Error', err.message))
    }
  }, [accounts, ueContract, web3])

  const createCharacter = () => {
    setLoading(true)
    ueContract.methods
      .createCharacter(typeCharacter, genderCharacter)
      .send({ from: accounts[0], value: web3.utils.toWei('0.001', 'Ether') })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((receipt) => {
        setLoading(false)
        console.log(receipt)
      })
  }

  const withdraw = () => {
    setLoading(true)
    ueContract.methods
      .withdraw()
      .send({ from: accounts[0] })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
        console.log(res)
      })
  }

  const fight = (_myTokenId, _rivalTokenId) => {
    setLoading(true)
    ueContract.methods
      .fight(_myTokenId, _rivalTokenId)
      .send({ from: accounts[0] })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
        console.log(res)
      })
  }

  const rest = (_myTokenId) => {
    setLoading(true)
    ueContract.methods
      .rest(_myTokenId)
      .send({ from: accounts[0] })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
        console.log(res)
      })
  }

  const buyStuff = (_stuffId) => {
    setLoading(true)
    ueContract.methods
      .buyStuff(_stuffId)
      .send({ from: accounts[0], value: web3.utils.toWei('0.001', 'Ether') })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
        console.log(res)
      })
  }

  const equipStuff = (_tokenId, _stuffId) => {
    setLoading(true)
    ueContract.methods
      .equipStuff(_tokenId, _stuffId)
      .send({ from: accounts[0] })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
        console.log(res)
      })
  }

  const potionUse = (_myTokenId) => {
    setLoading(true)
    ueContract.methods
      .usePotion(_myTokenId)
      .send({ from: accounts[0] })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
        console.log(res)
      })
  }

  // A REVOIR
  // const getBalanceStuff = async (_tokenId) => {
  //   if (accounts != null) {
  //     await ueContract.methods
  //       .getBalanceStuff(_tokenId)
  //       .call({ from: accounts[0] })
  //       .then(res => {
  //         console.log("bite", res)
  //       })
  //   }
  // }

  const typeCharacterName = (val) => {
    if (parseInt(val) === 0) {
      return 'BRUTE'
    } else if (parseInt(val) === 1) {
      return 'SPIRITUAL'
    } else {
      return 'ELEMENTARY'
    }
  }

  const typeGenderName = (val) => {
    if (parseInt(val) === 0) {
      return 'MASCULINE'
    } else if (parseInt(val) === 1) {
      return 'FEMININE'
    } else {
      return 'OTHER'
    }
  }

  const handleModal = (title, content) => {
    setTitleModal(title)
    setContentModal(content)
    setModalShow(true)
  }

  const attacks = (type, nb) => {
    const attacksType = {
      brute: ['Speed', 'Power', 'Resistance', 'Weapons'],
      spiritual: ['Gravitation', 'Electromagnetism', 'Magic', 'Invocation'],
      elementary: ['Air', 'Water', 'Earth', 'Fire'],
    }
    if (type === '0') return attacksType.brute[nb]
    if (type === '1') return attacksType.spiritual[nb]
    if (type === '2') return attacksType.elementary[nb]
  }

  const stuffType = [
    '',
    'BASIC SWORD',
    'BASIC SHIELD',
    'EXCALIBUR',
    'AEGIS',
    'POTION',
  ]

  // TRAVAIL EN COURS : ATTRIBUTION POINTS NOUVEAU NIVEAU
  const ButtonAttributes = ({ sign, state, setter }) => (
    <button
      style={{ marginRight: 5, marginLeft: 5 }}
      onClick={() =>
        sign == '+' ? setter(state + 1) : state == 0 ? 0 : setter(state - 1)
      }
    >
      {sign}
    </button>
  )

  return (
    <s.Screen>
      <s.Container ai="center" style={{ flex: 1, backgroundColor: '#6384BD' }}>
        {!web3 ? (
          <>
            <s.TextTitle>Loading Web3, accounts, and contract...</s.TextTitle>
            <Modal
              modalShow={modalShow}
              setModalShow={setModalShow}
              title={titleModal}
              content={contentModal}
            />
          </>
        ) : (
          <>
            <Navbar accounts={accounts} />

            <s.TextTitle>Unlimited Evolution</s.TextTitle>
            <s.TextSubTitle>
              Veuillez choisir un type de personnage
            </s.TextSubTitle>

            <div style={{ flexDirection: 'row' }}>
              <select onChange={(e) => setTypeCharacter(e.target.value)}>
                <option value="0">BRUTE</option>
                <option value="1">SPIRITUAL</option>
                <option value="2">ELEMENTARY</option>
              </select>

              <select onChange={(e) => setGenderCharacter(e.target.value)}>
                <option value="0">MASCULINE</option>
                <option value="1">FEMININE</option>
                <option value="2">OTHER</option>
              </select>

              <s.Button
                disabled={loading ? 1 : 0}
                onClick={() => createCharacter()}
                primary={loading ? '' : 'primary'}
              >
                CREATE CHARACTER
              </s.Button>
            </div>

            <s.TextTitle style={{ margin: 0 }}>Mes Persos</s.TextTitle>
            <s.SpacerSmall />
            {!characters && (
              <s.TextSubTitle>Créez votre premier NFT</s.TextSubTitle>
            )}

            <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
              {characters &&
                characters.length > 0 &&
                characters.map((character) => {
                  return (
                    <div key={character.id}>
                      <s.Container
                        ai="center"
                        style={{ minWidth: '200px', margin: 10 }}
                      >
                        <CharacterRenderer character={character} size={300} />
                        <s.TextDescription>
                          ID: {character.id}
                        </s.TextDescription>
                        <s.TextDescription>
                          Level: {character.level}
                        </s.TextDescription>
                        <s.TextDescription>
                          XP: {character.xp}
                        </s.TextDescription>
                        <s.TextDescription>
                          HP: {character.hp}
                        </s.TextDescription>
                        <s.TextDescription>
                          Stamina: {character.stamina}
                        </s.TextDescription>

                        {/* TRAVAIL EN COURS : ATTRIBUTION POINTS NOUVEAU NIVEAU */}
                        <s.Container fd="row" jc="center" ai="center">
                          <s.TextDescription>
                            {attacks(character.typeCharacter, 0)}:{' '}
                            {character.attack1}
                          </s.TextDescription>
                          {character.attributePoints > 0 && (
                            <div style={{ marginTop: 15 }}>
                              <ButtonAttributes
                                sign="-"
                                state={countAttributesAttack1}
                                setter={setCountAttributesAttack1}
                              />
                              {countAttributesAttack1}
                              <ButtonAttributes
                                sign="+"
                                state={countAttributesAttack1}
                                setter={setCountAttributesAttack1}
                              />
                            </div>
                          )}
                        </s.Container>

                        <s.TextDescription>
                          {attacks(character.typeCharacter, 1)}:{' '}
                          {character.attack2}
                        </s.TextDescription>
                        <s.TextDescription>
                          {attacks(character.typeCharacter, 2)}:{' '}
                          {character.defence1}
                        </s.TextDescription>
                        <s.TextDescription>
                          {attacks(character.typeCharacter, 3)}:{' '}
                          {character.defence2}
                        </s.TextDescription>
                        <s.TextDescription>
                          Type: {typeCharacterName(character.typeCharacter)}
                        </s.TextDescription>
                        <s.TextDescription>
                          Gender: {typeGenderName(character.genderCharacter)}
                        </s.TextDescription>
                        {character.weapon !== '0' && (
                          <s.TextDescription>
                            Weapon: {stuffType[character.weapon]}
                          </s.TextDescription>
                        )}
                        {character.shield !== '0' && (
                          <s.TextDescription>
                            Shield: {stuffType[character.shield]}
                          </s.TextDescription>
                        )}
                        <s.TextDescription>
                          Rest: {character.lastRest}
                        </s.TextDescription>
                        {(character.hp < 100 || character.stamina < 100) && (
                          <>
                            <s.Button
                              disabled={loading ? 1 : 0}
                              onClick={() => rest(character.id)}
                              primary={loading ? '' : 'primary'}
                            >
                              REST
                            </s.Button>
                            {balancePotion > 0 && (
                              <s.Button
                                disabled={loading ? 1 : 0}
                                onClick={() => potionUse(character.id)}
                                primary={loading ? '' : 'primary'}
                              >
                                USE A POTION
                              </s.Button>
                            )}
                          </>
                        )}
                      </s.Container>
                      <s.SpacerSmall />
                    </div>
                  )
                })}
            </s.Container>

            <s.SpacerLarge />

            <s.Container
              ai="center"
              style={{ flex: 1, backgroundColor: '#64E0E0' }}
            >
              <s.TextTitle>Mes Ennemis</s.TextTitle>

              {characters && characters.length > 0 && (
                <>
                  <s.TextSubTitle>
                    Veuillez choisir un personnage pour combattre
                  </s.TextSubTitle>
                  <select
                    onChange={(e) => setSelectedCharacter(e.target.value)}
                  >
                    <option value="">Please choose a character</option>
                    {characters.map((character) => (
                      // <option key={character.id} value={`{"id":${character.id},"mana":${character.mana}}`}>ID #{character.id}</option>
                      <option key={character.id} value={character.id}>
                        ID #{character.id}
                      </option>
                    ))}
                  </select>
                  {console.log(selectedCharacter)}
                </>
              )}

              <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
                {othersCharacters &&
                  othersCharacters.length > 0 &&
                  othersCharacters.map((character) => {
                    return (
                      <div key={character.id}>
                        <s.Container
                          ai="center"
                          style={{ minWidth: '200px', margin: 10 }}
                        >
                          <CharacterRenderer character={character} size={300} />
                          <s.TextDescription>
                            ID: {character.id}
                          </s.TextDescription>
                          {/* <s.TextDescription>DNA: {character.dna}</s.TextDescription> */}
                          <s.TextDescription>
                            Level: {character.level}
                          </s.TextDescription>
                          <s.TextDescription>
                            XP: {character.xp}
                          </s.TextDescription>
                          <s.TextDescription>
                            HP: {character.hp}
                          </s.TextDescription>
                          <s.TextDescription>
                            Stamina: {character.stamina}
                          </s.TextDescription>
                          <s.TextDescription>
                            {attacks(character.typeCharacter, 0)}:{' '}
                            {character.attack1}
                          </s.TextDescription>
                          <s.TextDescription>
                            {attacks(character.typeCharacter, 1)}:{' '}
                            {character.attack2}
                          </s.TextDescription>
                          <s.TextDescription>
                            {attacks(character.typeCharacter, 2)}:{' '}
                            {character.defence1}
                          </s.TextDescription>
                          <s.TextDescription>
                            {attacks(character.typeCharacter, 3)}:{' '}
                            {character.defence1}
                          </s.TextDescription>
                          <s.TextDescription>
                            Type: {typeCharacterName(character.typeCharacter)}
                          </s.TextDescription>
                          <s.TextDescription>
                            Gender: {typeGenderName(character.genderCharacter)}
                          </s.TextDescription>
                          {character.weapon !== '0' && (
                            <s.TextDescription>
                              Weapon: {stuffType[character.weapon]}
                            </s.TextDescription>
                          )}
                          {character.shield !== '0' && (
                            <s.TextDescription>
                              Shield: {stuffType[character.shield]}
                            </s.TextDescription>
                          )}

                          {characters &&
                            characters.length > 0 &&
                            selectedCharacter && (
                              <s.Container fd="row" jc="center">
                                <s.Button
                                  disabled={loading ? 1 : 0}
                                  onClick={() =>
                                    fight(selectedCharacter, character.id)
                                  }
                                  primary={loading ? '' : 'primary'}
                                >
                                  FIGHT
                                </s.Button>
                              </s.Container>
                            )}
                        </s.Container>
                        <s.SpacerSmall />
                      </div>
                    )
                  })}
              </s.Container>
              <Modal
                modalShow={modalShow}
                setModalShow={setModalShow}
                title={titleModal}
                content={contentModal}
              />
              <s.SpacerLarge />
            </s.Container>
          </>
        )}

        {/* Partie équipement Achat et Equiper */}
        {/* Partie Achat */}
        <s.Container
          ai="center"
          style={{ flex: 1, backgroundColor: '#D7D6DE' }}
        >
          <s.TextTitle>Partie Equipement</s.TextTitle>
          <div style={{ flexDirection: 'row' }}>
            <select
              onChange={(e) =>
                setTypeBuyStuff(e.currentTarget.selectedIndex + 1)
              }
            >
              {stuffType
                .filter((stuff) => {
                  if (stuff === '') {
                    return false
                  } else {
                    return true
                  }
                })
                .map((stuff, i) => (
                  <option key={i} value={i}>
                    {stuff}
                  </option>
                ))}
            </select>

            <s.Button
              disabled={loading ? 1 : 0}
              onClick={() => buyStuff(typeBuyStuff)}
              primary={loading ? '' : 'primary'}
            >
              Achat équipement
            </s.Button>
          </div>

          {/* Partie Equiper */}
          <div style={{ flexDirection: 'row' }}>
            {stuffs &&
              stuffs.length > 0 &&
              characters &&
              characters.length > 0 && (
                <>
                  <s.TextSubTitle>
                    Veuillez choisir un objet et un personnage à équiper
                  </s.TextSubTitle>
                  <select onChange={(e) => setTypeEquipStuff(e.target.value)}>
                    <option value="">Please choose a stuff</option>
                    {stuffs &&
                      stuffs.map((stuff) => (
                        <option key={stuff.id} value={stuff.id}>
                          {stuffType[stuff.id]}
                        </option>
                      ))}
                  </select>
                  <select onChange={(e) => setTypeEquipChar(e.target.value)}>
                    <option value="">Please choose a character</option>
                    {characters.map((character) => (
                      <option key={character.id} value={character.id}>
                        ID #{character.id}
                      </option>
                    ))}
                  </select>

                  {typeEquipStuff != 0 && typeEquipChar != 0 && (
                    <s.Button
                      disabled={loading ? 1 : 0}
                      onClick={() => equipStuff(typeEquipChar, typeEquipStuff)}
                      primary={loading ? '' : 'primary'}
                    >
                      Equiper stuff
                    </s.Button>
                  )}
                </>
              )}
          </div>
          <s.SpacerLarge />
        </s.Container>

        <s.Container
          ai="center"
          style={{ flex: 1, backgroundColor: '#B68D8D' }}
        >
          <s.TextTitle>Mon Equipement</s.TextTitle>

          <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
            {balancePotion > 0 && (
              <s.Container
                ai="center"
                style={{ minWidth: '200px', margin: 10 }}
              >
                <s.TextDescription>Name : POTION</s.TextDescription>
                <s.TextDescription>HP : FULL</s.TextDescription>
                <s.TextDescription>STAMINA : FULL</s.TextDescription>
                <s.TextDescription>
                  QUANTITY : {balancePotion}
                </s.TextDescription>
              </s.Container>
            )}
            {stuffs &&
              stuffs.length > 0 &&
              stuffs.map((stuff) => {
                return (
                  <div key={stuff.id}>
                    <s.Container
                      ai="center"
                      style={{ minWidth: '200px', margin: 10 }}
                    >
                      {/* <CharacterRenderer character={character} size={300} /> */}
                      <s.TextDescription>
                        Name : {stuffType[stuff.id]}
                      </s.TextDescription>
                      <s.TextDescription>
                        Bonus Attack 1 : {stuff.bonusAttack1}
                      </s.TextDescription>
                      <s.TextDescription>
                        Bonus Attack 2 : {stuff.bonusAttack2}
                      </s.TextDescription>
                      <s.TextDescription>
                        Bonus Defence 1 : {stuff.bonusDefence1}
                      </s.TextDescription>
                      <s.TextDescription>
                        Bonus Defence 2 : {stuff.bonusDefence2}
                      </s.TextDescription>
                      <s.TextDescription>
                        Type : {stuff.typeStuff === '0' ? 'WEAPON' : 'SHIELD'}
                      </s.TextDescription>
                      {/* <s.TextDescription>
                      Quantity : 
                    </s.TextDescription> */}
                    </s.Container>
                    <s.SpacerSmall />
                  </div>
                )
              })}
          </s.Container>

          <s.SpacerLarge />
        </s.Container>

        {owner && (
          <s.Button
            disabled={loading ? 1 : 0}
            onClick={() => withdraw()}
            primary={loading ? '' : 'primary'}
          >
            WITHDRAW
          </s.Button>
        )}
      </s.Container>
    </s.Screen>
  )
}

export default App
