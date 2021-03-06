import React, { useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import * as s from './styles/globalStyles'
import UnlimitedEvolution from './contracts/UnlimitedEvolution.json'
import getWeb3 from './getWeb3'
import Home from './pages/Home'
import Modal from './components/Modal'
import MyCharacters from './pages/MyCharacters'
import MyEnemies from './pages/MyEnemies'
import MyStuff from './pages/MyStuff'
import Navbar from './components/Navbar'

const App = () => {
  const [web3, setWeb3] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [ueContract, setUeContract] = useState(null)
  const [timeStamp, setTimeStamp] = useState(null)
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
  const [balancesContractStuff, setBalancesContractStuff] = useState([])
  const [balancesMyStuff, setBalancesMyStuff] = useState([])
  const [typeBuyStuff, setTypeBuyStuff] = useState({
    id: '1',
    mintPrice: '0.001',
  })
  const [typeEquipChar, setTypeEquipChar] = useState(0)

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
        if (networkId !== 1337 && networkId !== 80001) {
          handleModal(
            'Wrong Network',
            'Please Switch to the Mumbai Polygon Network',
          )
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

        let lastBlockNumber = await web3.eth.getBlockNumber()
        let lastBlockInfo = await web3.eth.getBlock(lastBlockNumber)
        setTimeStamp(lastBlockInfo.timestamp)

        let balanceContractStuff = []
        let balanceMyStuff = []
        for (let i = 0; i < 6; i++) {
          await ueContract.methods
            .balanceOf(ueContract._address, i)
            .call({ from: accounts[0] })
            .then((res) => balanceContractStuff.push(res))

          await ueContract.methods
            .balanceOf(accounts[0], i)
            .call({ from: accounts[0] })
            .then((res) => balanceMyStuff.push(res))
        }
        setBalancesContractStuff(balanceContractStuff)
        setBalancesMyStuff(balanceMyStuff)

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
            lastBlockNumber = await web3.eth.getBlockNumber()
            lastBlockInfo = await web3.eth.getBlock(lastBlockNumber)
            setTimeStamp(lastBlockInfo.timestamp)
            let balanceContractStuff = []
            let balanceMyStuff = []
            for (let i = 0; i < 6; i++) {
              await ueContract.methods
                .balanceOf(ueContract._address, i)
                .call({ from: accounts[0] })
                .then((res) => balanceContractStuff.push(res))

              await ueContract.methods
                .balanceOf(accounts[0], i)
                .call({ from: accounts[0] })
                .then((res) => balanceMyStuff.push(res))
            }
            setBalancesContractStuff(balanceContractStuff)
            setBalancesMyStuff(balanceMyStuff)
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

  // useEffect(() => {
  //   const balanceContractStuff = async () => {
  //     if (ueContract !== null && web3 !== null && accounts !== null) {
  //       let tempArray = []
  //       for (let i = 0; i < 6; i++) {
  //         await ueContract.methods
  //           .balanceOf(ueContract._address, i)
  //           .call({ from: accounts[0] })
  //           .then((res) => tempArray.push(res))
  //       }
  //       setBalancesContractStuff(tempArray)
  //     }
  //   }
  //   const balanceMyStuff = async () => {
  //     if (ueContract !== null && web3 !== null && accounts !== null) {
  //       let tempArray = []
  //       for (let i = 0; i < 6; i++) {
  //         await ueContract.methods
  //           .balanceOf(accounts[0], i)
  //           .call({ from: accounts[0] })
  //           .then((res) => tempArray.push(res))
  //       }
  //       setBalancesMyStuff(tempArray)
  //     }
  //   }
  //   balanceContractStuff()
  //   balanceMyStuff()
  // }, [ueContract, web3, accounts, stuffs])

  // EVENTS
  useEffect(() => {
    if (ueContract !== null && web3 !== null && accounts !== null) {
      ueContract.events
        .CharacterCreated()
        .on('data', (event) =>
          handleModal(
            `Character Created ID #${event.returnValues.id}`,
            'Your character is ready, you can interacting with other NFTs',
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

      ueContract.events
        .StuffBought()
        .on('data', (event) =>
          handleModal(
            'Congratulations !',
            `You bought the stuff #${event.returnValues.stuffId}.`,
          ),
        )
        .on('error', (err) => handleModal('Error', err.message))
      ueContract.events
        .StuffEquiped()
        .on('data', (event) =>
          handleModal(
            'Congratulations !',
            `Your character #${event.returnValues.tokenId} is now equiped with the stuff #${event.returnValues.stuffId}.`,
          ),
        )
        .on('error', (err) => handleModal('Error', err.message))
      ueContract.events
        .PotionUsed()
        .on('data', (event) =>
          handleModal(
            'Congratulations !',
            `Your character #${event.returnValues.tokenId} used a potion and just recovered 100 hp and stamina.`,
          ),
        )
        .on('error', (err) => handleModal('Error', err.message))
    }
  }, [accounts, ueContract, web3])

  const createCharacter = () => {
    setLoading(true)
    ueContract.methods
      .askCreateCharacter(typeCharacter, genderCharacter)
      .send({ from: accounts[0], value: web3.utils.toWei('0.001', 'Ether') })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((receipt) => {
        setLoading(false)
      })
  }

  const fight = (_myTokenId, _rivalTokenId) => {
    setLoading(true)
    ueContract.methods
      .askFight(_myTokenId, _rivalTokenId)
      .send({ from: accounts[0] })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
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
      })
  }

  const buyStuff = (_stuffId, _mintPrice) => {
    setLoading(true)
    ueContract.methods
      .buyStuff(_stuffId)
      .send({
        from: accounts[0],
        value: web3.utils.toWei(_mintPrice.toString(), 'Ether'),
      })
      .once('error', (err) => {
        setLoading(false)
        console.log(err)
      })
      .then((res) => {
        setLoading(false)
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
      })
  }

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
    ['', ''],
    ['BASIC SWORD', '0.001'],
    ['BASIC SHIELD', '0.001'],
    ['EXCALIBUR', '0.1'],
    ['AEGIS', '0.1'],
    ['POTION', '0.001'],
  ]

  const resting = (character, timeStamp) => {
    if (timeStamp - 86400 < character.lastRest) {
      return `ID#${character.id} is Resting (can't fight)`
    }
  }

  return (
    <s.Screen>
      {!web3 ? (
        <>
          <s.TextTitle color="black" style={{ alignSelf: 'center' }}>
            Loading Web3, accounts, and contract...
          </s.TextTitle>
          <Modal
            modalShow={modalShow}
            setModalShow={setModalShow}
            title={titleModal}
            content={contentModal}
          />
        </>
      ) : (
        <>
          <Routes>
            <Route path="/" element={<Navbar accounts={accounts} />}>
              <Route index element={<Home />} />
              <Route
                path="MyCharacters"
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
                    potionUse={potionUse}
                    resting={resting}
                    timeStamp={timeStamp}
                    balancesMyStuff={balancesMyStuff}
                  />
                }
              />
              <Route
                path="MyEnemies"
                element={
                  <MyEnemies
                    loading={loading}
                    characters={characters}
                    typeCharacterName={typeCharacterName}
                    typeGenderName={typeGenderName}
                    othersCharacters={othersCharacters}
                    setSelectedCharacter={setSelectedCharacter}
                    selectedCharacter={selectedCharacter}
                    fight={fight}
                    timeStamp={timeStamp}
                  />
                }
              />
              <Route
                path="MyStuff"
                element={
                  <MyStuff
                    loading={loading}
                    characters={characters}
                    stuffs={stuffs}
                    stuffType={stuffType}
                    buyStuff={buyStuff}
                    equipStuff={equipStuff}
                    setTypeBuyStuff={setTypeBuyStuff}
                    typeBuyStuff={typeBuyStuff}
                    setTypeEquipChar={setTypeEquipChar}
                    typeEquipChar={typeEquipChar}
                    potionUse={potionUse}
                    balancesContractStuff={balancesContractStuff}
                    balancesMyStuff={balancesMyStuff}
                  />
                }
              />
              <Route
                path="*"
                element={
                  <s.Container
                    bc="pink"
                    ai="center"
                    flex="1"
                    style={{ paddingTop: 80 }}
                  >
                    <s.TextTitle fs="80" style={{ marginTop: 80 }}>
                      Il n'y a rien ici !
                    </s.TextTitle>
                    <s.ButtonHome>
                      <s.ButtonLink to="/">Accueil</s.ButtonLink>
                    </s.ButtonHome>
                  </s.Container>
                }
              />
            </Route>
          </Routes>

          <Modal
            modalShow={modalShow}
            setModalShow={setModalShow}
            title={titleModal}
            content={contentModal}
          />
        </>
      )}
    </s.Screen>
  )
}

export default App
