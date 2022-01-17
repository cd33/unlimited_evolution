import React from 'react'
import * as s from '../styles/globalStyles'
import StuffRenderer from '../components/StuffRenderer'
import img from '../img/MyStuff.jpg'

const MyStuff = ({
  loading,
  stuffs,
  characters,
  stuffType,
  setTypeBuyStuff,
  buyStuff,
  typeBuyStuff,
  setTypeEquipChar,
  typeEquipChar,
  equipStuff,
  potionUse,
  balancesContractStuff,
  balancesMyStuff,
}) => {
  const handleSelectedCharacter = (e) => {
    if (e === '') {
      setTypeEquipChar(null)
      return null
    }
    let tempArray = { id: null, hp: null, stamina: null }
    let character = JSON.parse(e)
    tempArray.id = character.id
    tempArray.hp = character.hp
    tempArray.stamina = character.stamina
    setTypeEquipChar(tempArray)
  }

  return (
    <s.Container image={img} ai="center" flex="1" style={{ paddingTop: 80 }}>
      <s.TextTitle>Boutique</s.TextTitle>
      <div style={{ flexDirection: 'row' }}>
        <s.Select onChange={(e) => setTypeBuyStuff(e.target.value)}>
          {stuffType.map((stuff, i) => {
            if (balancesContractStuff[i] !== '0') {
              return (
                <option key={i} value={i}>
                  {stuff}
                </option>
              )
            } else return ''
          })}
        </s.Select>

        <s.ButtonTop
          disabled={loading ? 1 : 0}
          onClick={() => buyStuff(typeBuyStuff)}
          primary={loading ? '' : 'primary'}
        >
          Achat équipement
        </s.ButtonTop>
      </div>

      <s.SpacerLarge />

      <s.TextTitle>Mon Equipement</s.TextTitle>
      {characters && characters.length > 0 ? (
        stuffs.length > 0 || balancesMyStuff[5] > 0 ? (
          <>
            <s.TextSubTitle>
              Veuillez choisir un personnage à équiper
            </s.TextSubTitle>
            <s.Select
              bc="#46bcb9"
              color="white"
              onChange={(e) => {
                handleSelectedCharacter(e.target.value)
              }}
            >
              <option value="">Choisissez un personnage</option>
              {characters.map((character) => (
                <option
                  key={character.id}
                  value={`{"id":${character.id},"hp":${character.hp},"stamina":${character.stamina}}`}
                >
                  ID #{character.id}
                </option>
              ))}
            </s.Select>
          </>
        ) : (
          <s.TextSubTitle style={{ marginTop: 50 }}>
            Vous ne possédez pas encore d'équipement.
            <br />
            La boutique est juste au dessus.
          </s.TextSubTitle>
        )
      ) : (
        <>
          <s.TextSubTitle>
            Vous ne possédez pas encore de Personnage.
          </s.TextSubTitle>
          <s.ButtonHome>
            <s.ButtonLink to="/MyCharacters">
              Commencer l'aventure !
            </s.ButtonLink>
          </s.ButtonHome>
        </>
      )}
      <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
        {balancesMyStuff[5] > 0 && (
          <s.ContainerCard
            ai="center"
            jc="space-around"
            style={{ minHeight: 397, margin: 30 }}
          >
            <StuffRenderer stuffId={5} size={200} />
            <s.Container bc="black" ai="center" flex="1" jc="center">
              <s.TextDescription>Name : POTION</s.TextDescription>
              <s.TextDescription>HP : FULL</s.TextDescription>
              <s.TextDescription>Stamina : FULL</s.TextDescription>
              <s.TextDescription>
                Quantity : {balancesMyStuff[5]}
              </s.TextDescription>
            </s.Container>

            {characters &&
            characters.length > 0 &&
            typeEquipChar &&
            (typeEquipChar.hp < 100 || typeEquipChar.stamina < 100) ? (
              <s.Button
                disabled={loading ? 1 : 0}
                onClick={() => potionUse(typeEquipChar.id)}
                primary={loading ? '' : 'primary'}
              >
                USE A POTION
              </s.Button>
            ) : (
              ''
            )}
          </s.ContainerCard>
        )}
        {stuffs &&
          stuffs.length > 0 &&
          stuffs.map((stuff) => {
            return (
              <div key={stuff.id} style={{ margin: 30 }}>
                <s.ContainerCard ai="center" style={{ minWidth: 200 }}>
                  <StuffRenderer stuffId={stuff.id} size={200} />
                  <s.Container bc="black" ai="center">
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
                    <s.TextDescription>
                      Quantity : {balancesMyStuff[stuff.id]}
                    </s.TextDescription>
                  </s.Container>

                  {characters && characters.length > 0 && typeEquipChar ? (
                    <s.Button
                      disabled={loading ? 1 : 0}
                      onClick={() => equipStuff(typeEquipChar.id, stuff.id)}
                      primary={loading ? '' : 'primary'}
                    >
                      Equiper Stuff
                    </s.Button>
                  ) : (
                    ''
                  )}
                </s.ContainerCard>
              </div>
            )
          })}
      </s.Container>

      <s.SpacerLarge />
    </s.Container>
  )
}

export default MyStuff
