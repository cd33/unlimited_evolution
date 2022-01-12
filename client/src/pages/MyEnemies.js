import React from 'react'
import * as s from '../globalStyles'
import CharacterRenderer from '../components/CharacterRenderer'

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
  return (
    <s.Container ai="center" style={{ flex: 1, backgroundColor: '#64E0E0', paddingTop: 80 }}>
      <s.TextTitle>Mes Ennemis</s.TextTitle>

      {characters && characters.length > 0 && (
        <>
          <s.TextSubTitle>
            Veuillez choisir un personnage pour combattre
          </s.TextSubTitle>
          <select onChange={(e) => setSelectedCharacter(e.target.value)}>
            <option value="">Please choose a character</option>
            {characters.map((character) => {
              if (timeStamp - 86400 > character.lastRest) {
                return (
                  <option key={character.id} value={character.id}>
                    ID #{character.id}
                  </option>
                )
              }
            })}
          </select>
        </>
      )}

      <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
        {othersCharacters &&
          othersCharacters.length > 0 &&
          othersCharacters.map((character) => {
            if (timeStamp - 86400 > character.lastRest) {
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

                    {characters &&
                      characters.length > 0 &&
                      selectedCharacter &&
                      timeStamp - 86400 > character.lastRest && (
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
            }
          })}
      </s.Container>
      <s.SpacerLarge />
    </s.Container>
  )
}

export default MyEnemies
