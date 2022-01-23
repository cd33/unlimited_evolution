import React from 'react'
import * as s from '../styles/globalStyles'
import CharacterRenderer from '../components/CharacterRenderer'
import img from '../img/MyCharacters.jpg'

const MyCharacters = ({
  loading,
  rest,
  createCharacter,
  setTypeCharacter,
  setGenderCharacter,
  characters,
  attacks,
  typeCharacterName,
  typeGenderName,
  stuffType,
  potionUse,
  resting,
  timeStamp,
  balancesMyStuff,
}) => {
  return (
    <s.Container image={img} ai="center" flex="1" style={{ paddingTop: 80 }}>
      <s.TextTitle>Mes Personnages</s.TextTitle>
      <s.TextSubTitle>Veuillez choisir un type de personnage</s.TextSubTitle>

      <s.Container fd="row" ai="center" jc="center">
        <s.Select
          onChange={(e) => setTypeCharacter(e.target.value)}
          style={{ marginRight: 16, marginLeft: 16 }}
        >
          <option value="0">BRUTE</option>
          <option value="1">SPIRITUAL</option>
          <option value="2">ELEMENTARY</option>
        </s.Select>

        <s.Select onChange={(e) => setGenderCharacter(e.target.value)}>
          <option value="0">MASCULINE</option>
          <option value="1">FEMININE</option>
          <option value="2">OTHER</option>
        </s.Select>

        <s.ButtonTop
          bc="#63b93f"
          disabled={loading ? 1 : 0}
          onClick={() => createCharacter()}
          primary={loading ? '' : 'primary'}
        >
          CREER PERSONNAGE
        </s.ButtonTop>
      </s.Container>
      <s.SpacerSmall />
      {!characters && <s.TextSubTitle>Créez votre premier NFT</s.TextSubTitle>}

      {characters &&
        characters.length > 0 &&
        characters.map((character) => {
          return (
              <s.ContainerCardMyCharacters
                key={character.id}
                bc="#85d45c"
                border="2px solid"
                style={{ borderRadius: 20, margin: 20}} //, width: "90%"
              >
                <s.Container fd="row">
                <CharacterRenderer character={character} size={450} />

                <s.Container flex="1" ai="center" style={{marginLeft: 50}}>
                    <s.Container
                      fd="row"
                      jc="center"
                      style={{marginTop: 10, marginBottom:20}}
                    >
                      <s.TextButtonStyle fs="25px" width="125px" br="25px" style={{marginRight:20}}>ID: {character.id}</s.TextButtonStyle>
                      <s.TextButtonStyle fs="25px" width="125px" br="25px" bc="green">
                        Level: {character.level}
                      </s.TextButtonStyle>
                    </s.Container>

                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>XP: {character.xp}</s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>HP: {character.hp}</s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    Stamina: {character.stamina}
                  </s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    {attacks(character.typeCharacter, 0)}: {character.attack1}
                  </s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    {attacks(character.typeCharacter, 1)}: {character.attack2}
                  </s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    {attacks(character.typeCharacter, 2)}: {character.defence1}
                  </s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    {attacks(character.typeCharacter, 3)}: {character.defence2}
                  </s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    Type: {typeCharacterName(character.typeCharacter)}
                  </s.TextSubTitle>
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    Gender: {typeGenderName(character.genderCharacter)}
                  </s.TextSubTitle>
                  {character.weapon !== '0' && (
                    <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                      Weapon: {stuffType[character.weapon][0]}
                    </s.TextSubTitle>
                  )}
                  {character.shield !== '0' && (
                    <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                      Shield: {stuffType[character.shield][0]}
                    </s.TextSubTitle>
                  )}
                  <s.TextSubTitle fs="24" style={{marginBottom: 5}}>
                    {resting(character, timeStamp)}
                  </s.TextSubTitle>
                  
                </s.Container>
                </s.Container>
                {(character.hp < 100 || character.stamina < 100) && (
                    <s.Container fd="row" jc="space-around">
                      <s.Button
                        disabled={loading ? 1 : 0}
                        onClick={() => rest(character.id)}
                        primary={loading ? '' : 'primary'}
                      >
                        SE REPOSER
                      </s.Button>
                      {balancesMyStuff[5] > 0 && (
                        <s.Button
                          disabled={loading ? 1 : 0}
                          onClick={() => potionUse(character.id)}
                          primary={loading ? '' : 'primary'}
                        >
                          UTILISER UNE POTION
                        </s.Button>
                      )}
                    </s.Container>
                  )}
              </s.ContainerCardMyCharacters>
          )
        })}
    </s.Container>
  )
}

export default MyCharacters
