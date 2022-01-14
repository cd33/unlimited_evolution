import React from 'react'
import * as s from '../styles/globalStyles'
import CharacterRenderer from '../components/CharacterRenderer'
import img from '../img/Arena.jpg'

const MyEnemies = ({
  loading,
  characters,
  typeCharacterName,
  typeGenderName,
  setSelectedCharacter,
  othersCharacters,
  selectedCharacter,
  fight,
  timeStamp,
}) => {
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

      {characters && characters.length > 0 && (
        <>
          <s.TextSubTitle>
            Veuillez choisir un personnage pour combattre
          </s.TextSubTitle>
          {/* <select onChange={(e) => setSelectedCharacter(e.target.value)}> */}
          <select onChange={(e) => handleSelectedCharacter(e.target.value)}>
            <option value="">Please choose a character</option>
            {characters.map((character) => {
              if (timeStamp - 86400 > character.lastRest) {
                return (
                  <option
                    key={character.id}
                    // value={character.id}
                    value={`{"id":${character.id},"level":${character.level}}`}
                  >
                    ID #{character.id}
                  </option>
                )
              } else return ''
            })}
          </select>
        </>
      )}

      <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
        {othersCharacters &&
          othersCharacters.length > 0 &&
          othersCharacters.map((character) => {
            if (
              timeStamp - 86400 > character.lastRest &&
              character.hp > 0 && selectedCharacter &&
              selectedCharacter.level <= character.level
            ) {
              return (
                <div key={character.id}>
                  <s.Container
                    ai="center"
                    style={{ minWidth: '200px', margin: 10 }}
                  >
                    <CharacterRenderer character={character} size={300} />
                    <s.TextDescription>ID: {character.id}</s.TextDescription>
                    <s.TextDescription>
                      Level: {character.level}
                    </s.TextDescription>
                    <s.TextDescription>
                      Type: {typeCharacterName(character.typeCharacter)}
                    </s.TextDescription>
                    <s.TextDescription>
                      Gender: {typeGenderName(character.genderCharacter)}
                    </s.TextDescription>

                    {characters && characters.length > 0 && (
                      <s.Container fd="row" jc="center">
                        <s.Button
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
                  </s.Container>
                  <s.SpacerSmall />
                </div>
              )
            } else return ''
          })    
        }

{/* MESSAGE d'erreur quand aucun ennemie n'est disponible */}
{/* <s.TextSubTitle style={{ textAlign: 'center' }}>
    Aucun Ennemies disponible
    <br />
    (niveau trop faible, mort ou en repos)
    </s.TextSubTitle> */}

      </s.Container>
      <s.SpacerLarge />
    </s.Container>
  )
}

export default MyEnemies
