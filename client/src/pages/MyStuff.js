import React from 'react'
import * as s from '../globalStyles'

const MyStuff = ({stuffs, balancePotion, stuffType}) => {
  return (
    <s.Container ai="center" style={{ flex: 1, backgroundColor: '#B68D8D' }}>
      <s.TextTitle>Mon Equipement</s.TextTitle>

      <s.Container fd="row" jc="center" style={{ flexWrap: 'wrap' }}>
        {balancePotion > 0 && (
          <s.Container ai="center" style={{ minWidth: '200px', margin: 10 }}>
            <s.TextDescription>Name : POTION</s.TextDescription>
            <s.TextDescription>HP : FULL</s.TextDescription>
            <s.TextDescription>STAMINA : FULL</s.TextDescription>
            <s.TextDescription>QUANTITY : {balancePotion}</s.TextDescription>
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
  )
}

export default MyStuff
