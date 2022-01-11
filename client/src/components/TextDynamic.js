import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../style/Texte.css'

const TextDynamic = () => {
  let array = ['Bitcoin', 'Ethereum', 'polygone', 'Combats']
  let wordIndex = 0
  let letterIndex = 0

  useEffect(() => {
    const target = document.getElementById('text-target')

    const createLetter = () => {
      const letter = document.createElement('span')
      target.appendChild(letter)

      letter.classList.add('letter')
      letter.style.opacity = '0'
      letter.style.animation = 'anim 5s ease forwards'
      letter.textContent = array[wordIndex][letterIndex]

      setTimeout(() => {
        letter.remove()
      }, 2000)
    }

    const loop = () => {
      setTimeout(() => {
        if (wordIndex >= array.length) {
          wordIndex = 0
          letterIndex = 0
          loop()
        } else if (letterIndex < array[wordIndex].length) {
          createLetter()
          letterIndex++
          loop()
        } else {
          letterIndex = 0
          wordIndex++
          setTimeout(() => {
            loop()
          }, 2000)
        }
      }, 80)
    }
    loop()
  }, [])
  return (
    <div className="home">
      <div className="texteAccueil">
        <h1 className="titre">Unlimited Evolution</h1>
        <span className="dynamicText">
          <span className="simply">Jeux de NFT</span>
          <span id="text-target"></span>
        </span>
        {/* <div className="button">
          <Link to="/MyCharacters">
            <div className="bouton">MES PERSOS</div>
          </Link>
          <Link to="/MyStuff">
            <div className="bouton">MON EQUIPEMENT</div>
          </Link>
          <Link to="/MyEnemies">
            <div className="bouton">MES ENNEMIES</div>
          </Link>
          <Link to="/ManageStuff">
            <div className="bouton">ACHETER/GERER EQUIPEMENT</div>
          </Link>
        </div> */}
      </div>
    </div>
  )
}

export default TextDynamic
