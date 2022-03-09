import React, { useEffect, useState } from 'react'
import * as s from '../styles/globalStyles'
import CharacterRenderer from '../components/CharacterRenderer'
import img from '../img/Arena.jpg'

const MyEnemies = ({
  loading,
  characters,
  typeCharacterName,
  typeGenderName,
  othersCharacters,
  setSelectedCharacter,
  selectedCharacter,
  fight,
  timeStamp,
}) => {
  const [charactersDisplayed, setCharactersDisplayed] = useState([])

  useEffect(() => {
    setSelectedCharacter(null)
  }, [setSelectedCharacter])

  useEffect(() => {
    if (othersCharacters && othersCharacters.length > 0) {
      let tempArray = []
      othersCharacters.map((character) => {
        if (
          timeStamp - 86400 > character.lastRest &&
          character.hp > 0 &&
          selectedCharacter &&
          selectedCharacter.level <= character.level
        ) {
          tempArray.push(character)
        }
        return ''
      })
      setCharactersDisplayed(tempArray)
    }
  }, [selectedCharacter, othersCharacters, timeStamp])

  const handleSelectedCharacter = (e) => {
    if (e === '') {
      setSelectedCharacter(null)
      return null
    }
    let tempArray = { id: null, level: null }
    let character = JSON.parse(e)
    tempArray.id = character.id
    tempArray.level = character.level
    setSelectedCharacter(tempArray)
  }
  return (
    <s.Container image={img} ai="center" flex="1" style={{ paddingTop: 80 }}>
      <s.TextTitle>Mes Ennemis</s.TextTitle>

      {characters && characters.length > 0 ? (
        <>
          <s.TextSubTitle style={{marginTop: 30}}>
            Veuillez choisir un personnage pour combattre
          </s.TextSubTitle>
          <s.Select onChange={(e) => handleSelectedCharacter(e.target.value)} style={{marginTop: 30}}>
            <option value="">Choisissez un personnage</option>
            {characters.map((character) => {
              if (timeStamp - 86400 > character.lastRest) {
                return (
                  <option
                    key={character.id}
                    value={`{"id":${character.id},"level":${character.level}}`}
                  >
                    ID #{character.id}
                  </option>
                )
              } else return ''
            })}
          </s.Select>
        </>
      ) : (
        <>
          <s.TextSubTitle style={{ marginTop: 50 }}>
            Pour débuter un combat, <br /> Vous devez posséder un personnage
          </s.TextSubTitle>
          <s.ButtonHome>
            <s.ButtonLink to="/MyCharacters">
              Commencer l'aventure !
            </s.ButtonLink>
          </s.ButtonHome>
        </>
      )}

      <s.Container
        fd="row"
        jc="center"
        style={{ flexWrap: 'wrap', marginTop: 30 }}
      >
        {selectedCharacter &&
          (charactersDisplayed.length > 0 ? (
            charactersDisplayed.map((character) => {
              return (
                <div
                  key={character.id}
                  style={{
                    marginTop: 15,
                    marginLeft: 50,
                    marginRight: 50,
                    marginBottom: 50,
                  }}
                >
                  <s.ContainerCard
                    ai="center"
                    bc="black"
                    border="2px solid white"
                    style={{ minWidth: 200, borderRadius: 10 }}
                  >
                    <CharacterRenderer character={character} size={300} />

                    <s.Container
                      fd="row"
                      jc="space-around"
                      style={{ marginTop: 30 }}
                    >
                      <s.TextButtonStyle>ID: {character.id}</s.TextButtonStyle>
                      <s.TextButtonStyle bc="green">
                        Level: {character.level}
                      </s.TextButtonStyle>
                    </s.Container>

                    <s.Container
                      fd="row"
                      jc="space-around"
                      style={{ marginTop: 20, fontSize: 16 }}
                    >
                      <s.TextDescription fs="16">
                        Type: {typeCharacterName(character.typeCharacter)}
                      </s.TextDescription>
                      <s.TextDescription fs="16">
                        Gender: {typeGenderName(character.genderCharacter)}
                      </s.TextDescription>
                    </s.Container>

                    {characters && characters.length > 0 && (
                      <s.Container fd="row" jc="center">
                        <s.Button
                          bchover="white"
                          colorhover="black"
                          disabled={loading ? 1 : 0}
                          onClick={() =>
                            fight(selectedCharacter.id, character.id)
                          }
                          primary={loading ? '' : 'primary'}
                        >
                          FIGHT
                        </s.Button>
                      </s.Container>
                    )}
                  </s.ContainerCard>
                  <s.SpacerSmall />
                </div>
              )
            })
          ) : (
            <s.TextSubTitle style={{ marginTop: 50 }}>
              Aucun Ennemis disponible
              <br />
              (niveau trop faible, mort ou en repos)
            </s.TextSubTitle>
          ))}
      </s.Container>
      <s.SpacerLarge />
    </s.Container>
  )
}

export default MyEnemies
