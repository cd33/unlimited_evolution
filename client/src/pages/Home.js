import React, { useEffect } from 'react'
import * as s from '../styles/globalStyles'
import img from '../img/home.jpg'

const Home = () => {
  useEffect(() => {
    let array = ['Bitcoin', 'Ethereum', 'polygone', 'Combats']
    let wordIndex = 0
    let letterIndex = 0
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
    <s.Container image={img} ai="center" flex="1" style={{ paddingTop: 80 }}>
      <s.TextTitle fs="80" style={{ marginTop: 80 }}>
        Unlimited Evolution
      </s.TextTitle>
      <span style={{display: "flex"}}>
        <s.TextSubTitle fs="50" color="#46bcb9">Gaming NFT</s.TextSubTitle>
        <span id="text-target"></span>  
      </span>
      <s.TextSubTitle fs="35" style={{ marginTop: 50, textAlign: 'center' }}>
        Jeu play-to-earn de combat avec des NFTs
        <br />
        Mesure-toi à d'autres joueurs, détruit les et obtiens des récompenses !
        <br />
      </s.TextSubTitle>
      <s.ButtonHome>
        <s.ButtonLink to="/MyCharacters">Commencer l'aventure !</s.ButtonLink>
      </s.ButtonHome>
    </s.Container>
  )
}

export default Home
