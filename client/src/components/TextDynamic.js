import React, { useEffect } from 'react'
// import { Link } from 'react-router-dom'

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
          <button type="button" className="btn btn-lg" id="btn1">
            <Link to="/MyCharacters">MES PERSOS</Link>
          </button>
          <button type="button" className="btn btn-secondary btn-lg" id="btn2">
            <Link to="/MyStuff">MON EQUIPEMENT</Link>
          </button>
          <button type="button" className="btn btn-secondary btn-lg" id="btn2">
            <Link to="/MyEnemies">MES ENNEMIES</Link>
          </button>
          <button type="button" className="btn btn-secondary btn-lg" id="btn2">
            <Link to="/ManageStuff">ACHETER/GERER EQUIPEMENT</Link>
          </button>
        </div> */}
      </div>
    </div>
  )
}

export default TextDynamic
