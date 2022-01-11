import React from 'react'
import * as s from '../globalStyles'

const ManageStuff = ({
  loading,
  characters,
  stuffType,
  stuffs,
  setTypeEquipStuff,
  typeEquipStuff,
  setTypeEquipChar,
  typeEquipChar,
  equipStuff,
}) => {
  return (
    <s.Container ai="center" style={{ flex: 1, backgroundColor: '#D7D6DE' }}>
      <div style={{ flexDirection: 'row' }}>
        {stuffs && stuffs.length > 0 && characters && characters.length > 0 && (
          <>
            <s.TextSubTitle>
              Veuillez choisir un objet et un personnage à équiper
            </s.TextSubTitle>
            <select onChange={(e) => setTypeEquipStuff(e.target.value)}>
              <option value="">Please choose a stuff</option>
              {stuffs &&
                stuffs.map((stuff) => (
                  <option key={stuff.id} value={stuff.id}>
                    {stuffType[stuff.id]}
                  </option>
                ))}
            </select>
            {/* <select onChange={(e) => setTypeEquipChar(e.target.value)}>
              <option value="">Please choose a character</option>
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  ID #{character.id}
                </option>
              ))}
            </select>

            {typeEquipStuff !== '0' && typeEquipChar !== '0' && (
              <s.Button
                disabled={loading ? 1 : 0}
                onClick={() => equipStuff(typeEquipChar, typeEquipStuff)}
                primary={loading ? '' : 'primary'}
              >
                Equiper stuff
              </s.Button>
            )} */}
          </>
        )}
      </div>
      <s.SpacerLarge />
    </s.Container>
  )
}

export default ManageStuff
