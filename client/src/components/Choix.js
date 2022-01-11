import React, { useState, useEffect } from 'react'
import UnlimitedEvolution from '../contracts/UnlimitedEvolution.json'
import getWeb3 from './getWeb3'
import * as s from './globalStyles'

const Choix = () => {
  return (
    <div className="choix">
      <h2>Veuillez choisir un type de personnage</h2>
      <div style={{ flexDirection: 'row' }} className="choose">
        <select
          onChange={(e) => setTypeCharacter(e.target.value)}
          className="choose1"
        >
          <option value="0">BRUTE</option>
          <option value="1">SPIRITUAL</option>
          <option value="2">ELEMENTARY</option>
        </select>

        <select
          onChange={(e) => setGenderCharacter(e.target.value)}
          className="choose2"
        >
          <option value="0">MASCULINE</option>
          <option value="1">FEMININE</option>
          <option value="2">OTHER</option>
        </select>

        <button
          className="valider"
          disabled={loading ? 1 : 0}
          onClick={() => createCharacter()}
          primary={loading ? '' : 'primary'}
        >
          VALIDER
        </button>
      </div>
    </div>
  )
}

export default Choix
