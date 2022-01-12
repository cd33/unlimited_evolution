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
  balancePotion,
  potionUse
}) => {

  const handleSelectedCharacter = (e) => {
    if (e === "") {setTypeEquipChar(null); return null};
    let tempArray = {id: null, hp: null, stamina: null};
    let character = JSON.parse(e);
    tempArray.id = character.id;
    tempArray.hp = character.hp;
    tempArray.stamina = character.stamina;
    setTypeEquipChar(tempArray);
  }
  
  return (
    <s.Container
      image={img}
      ai="center"
      style={{ flex: 1, backgroundColor: '#B68D8D', paddingTop: 80 }}
    >
      <s.TextTitle>Boutique</s.TextTitle>
      <div style={{ flexDirection: 'row' }}>
        <select
          onChange={(e) => setTypeBuyStuff(e.currentTarget.selectedIndex + 1)}
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

      <s.SpacerLarge />

      <s.TextTitle>Mon Equipement</s.TextTitle>
      {characters && characters.length > 0 && (
        <>
          <s.TextSubTitle>
            Veuillez choisir un personnage à équiper
          </s.TextSubTitle>
          <select onChange={(e) => {handleSelectedCharacter(e.target.value); console.log(e.target.value) }}>
            <option value="">Please choose a character</option>
            {characters.map((character) => (
              <option key={character.id} value={`{"id":${character.id},"hp":${character.hp},"stamina":${character.stamina}}`}>
                ID #{character.id}
              </option>
            ))}
            
          </select>
        </>
      )}
      <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
        {balancePotion > 0 && (
          <s.Container ai="center" style={{ minWidth: '200px', marginTop: 50 }}>
            <StuffRenderer stuffId={5} size={200} />
            <s.TextDescription>Name : POTION</s.TextDescription>
            <s.TextDescription>HP : FULL</s.TextDescription>
            <s.TextDescription>STAMINA : FULL</s.TextDescription>
            <s.TextDescription>QUANTITY : {balancePotion}</s.TextDescription>

            {characters && characters.length > 0 && typeEquipChar && (typeEquipChar.hp < 100 || typeEquipChar.stamina < 100) ? (
            <s.Button
            disabled={loading ? 1 : 0}
            onClick={() => potionUse(typeEquipChar.id)}
            primary={loading ? '' : 'primary'}
            >
            USE A POTION
            </s.Button>
            ): ""}

          </s.Container>
          
        )}
        {stuffs &&
          stuffs.length > 0 &&
          stuffs.map((stuff) => {
            return (
              <div key={stuff.id}>
                <s.Container
                  ai="center"
                  style={{ minWidth: '200px', margin: 50 }}
                >
                  <StuffRenderer stuffId={stuff.id} size={200} />
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

                  {characters && characters.length > 0 && typeEquipChar ? (
                    <s.Button
                      disabled={loading ? 1 : 0}
                      onClick={() => equipStuff(typeEquipChar.id, stuff.id)}
                      primary={loading ? '' : 'primary'}
                    >
                      Equiper stuff
                    </s.Button>
                  ) : (
                    ''
                  )}
                </s.Container>
                <s.SpacerSmall />
              </div>
            )
          })}
      </s.Container>

      <s.SpacerLarge />
    </s.Container>
  )
}

export default MyStuff
