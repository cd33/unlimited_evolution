import React from 'react'
import * as s from '../styles/globalStyles'
import CharacterRenderer from '../components/CharacterRenderer'
import img from '../img/MyCharacters.jpg'

const MyCharacters = ({
  loading,
  rest,
  setTypeCharacter,
  setGenderCharacter,
  createCharacter,
  characters,
  attacks,
  typeCharacterName,
  typeGenderName,
  stuffType,
  balancePotion,
  potionUse,
  resting,
  timeStamp,
}) => {
  return (
    <s.Container image={img} ai="center" flex="1" style={{ paddingTop: 80 }}>
      <s.TextTitle>Mes Personnages</s.TextTitle>
      <s.TextSubTitle>Veuillez choisir un type de personnage</s.TextSubTitle>

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
      <s.SpacerSmall />
      {!characters && <s.TextSubTitle>Créez votre premier NFT</s.TextSubTitle>}

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
                  <s.TextDescription>ID: {character.id}</s.TextDescription>
                  <s.TextDescription>
                    Level: {character.level}
                  </s.TextDescription>
                  <s.TextDescription>XP: {character.xp}</s.TextDescription>
                  <s.TextDescription>HP: {character.hp}</s.TextDescription>
                  <s.TextDescription>
                    Stamina: {character.stamina}
                  </s.TextDescription>
                  <s.TextDescription>
                    {attacks(character.typeCharacter, 0)}: {character.attack1}
                  </s.TextDescription>
                  <s.TextDescription>
                    {attacks(character.typeCharacter, 1)}: {character.attack2}
                  </s.TextDescription>
                  <s.TextDescription>
                    {attacks(character.typeCharacter, 2)}: {character.defence1}
                  </s.TextDescription>
                  <s.TextDescription>
                    {attacks(character.typeCharacter, 3)}: {character.defence2}
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
                    {resting(character, timeStamp)}
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
    </s.Container>
  )
}

export default MyCharacters
