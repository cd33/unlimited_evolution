import React, { useState, useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import UnlimitedEvolution from './contracts/UnlimitedEvolution.json'
import 'bootstrap/dist/css/bootstrap.min.css'
import getWeb3 from './getWeb3'
import * as s from './globalStyles'
import TextDynamic from './components/TextDynamic'
import Modal from './components/Modal'
import MyCharacters from './pages/MyCharacters'
import MyEnemies from './pages/MyEnemies'
import ManageStuff from './pages/ManageStuff'
import MyStuff from './pages/MyStuff'

import NavbarCustom from './components/Navbar'
import SocialNetwork from './components/SocialNetwork'
import logo from './img/logo.png'
import './style/Navbar.css'
import './style/Texte.css'

const App = () => {
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState(null)
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
  //         console.log(res)
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

  return (
    <s.Screen>
      <s.Container ai="center" style={{ flex: 1 }} className="hautDePage">
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
            <div className="navBar">
              <Link to="/">
                <img className="logo" src={logo} alt="Logo Unlimited Evolution"/>
              </Link>
              <NavbarCustom />
              <SocialNetwork accounts={accounts} />
            </div>
            <Routes>
              <Route path="/" element={<TextDynamic />} />
              <Route
                path="/MyCharacters"
                element={
                  <MyCharacters
                    loading={loading}
                    rest={rest}
                    createCharacter={createCharacter}
                    setTypeCharacter={setTypeCharacter}
                    setGenderCharacter={setGenderCharacter}
                    characters={characters}
                    attacks={attacks}
                    typeCharacterName={typeCharacterName}
                    typeGenderName={typeGenderName}
                    stuffType={stuffType}
                    balancePotion={balancePotion}
                    potionUse={potionUse}
                  />
                }
              />
              <Route
                path="/MyEnemies"
                element={
                  <MyEnemies
                    loading={loading}
                    characters={characters}
                    attacks={attacks}
                    typeCharacterName={typeCharacterName}
                    typeGenderName={typeGenderName}
                    setSelectedCharacter={setSelectedCharacter}
                    othersCharacters={othersCharacters}
                    selectedCharacter={selectedCharacter}
                    fight={fight}
                    stuffType={stuffType}
                  />
                }
              />
              <Route
                path="/MyStuff"
                element={
                  <MyStuff
                    stuffs={stuffs}
                    stuffType={stuffType}
                    balancePotion={balancePotion}
                  />
                }
              />
              <Route
                path="/ManageStuff"
                element={
                  <ManageStuff
                    loading={loading}
                    characters={characters}
                    stuffs={stuffs}
                    stuffType={stuffType}
                    buyStuff={buyStuff}
                    equipStuff={equipStuff}
                    setTypeBuyStuff={setTypeBuyStuff}
                    typeBuyStuff={typeBuyStuff}
                    setTypeEquipStuff={setTypeEquipStuff}
                    typeEquipStuff={typeEquipStuff}
                    setTypeEquipChar={setTypeEquipChar}
                    typeEquipChar={typeEquipChar}
                  />
                }
              />
            </Routes>

            <Modal
              modalShow={modalShow}
              setModalShow={setModalShow}
              title={titleModal}
              content={contentModal}
            />
          </>
        )}
      </s.Container>
    </s.Screen>
  )
}

export default App
