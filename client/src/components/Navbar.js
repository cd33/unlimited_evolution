import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import * as nav from'../styles/Navbar.style.js'
import logo from '../img/logo.png'

const Navbar = ({ accounts }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <nav.Nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <Link to="/">
          <img
            style={{ width: 50, height: 50, margin: 5 }}
            src={logo}
            alt="Logo Unlimited Evolution"
          />
        </Link>
        <nav.Menu isOpen={isOpen}>
          <Link to="/">
          <nav.MenuLink href="">Accueil</nav.MenuLink>
        </Link>
          <Link to="/MyCharacters">
            <nav.MenuLink href="">Mes Personnages</nav.MenuLink>
          </Link>
          <Link to="/MyStuff">
            <nav.MenuLink href="">Mon Equipement</nav.MenuLink>
          </Link>
          <Link to="/MyEnemies">
            <nav.MenuLink href="">Mes Ennemies</nav.MenuLink>
          </Link>
        </nav.Menu>
      </div>
      <nav.NavbarAddress margin={10} style={{color:"white"}}>
        {accounts !== null && accounts[0]}
      </nav.NavbarAddress>
      <nav.Hamburger onClick={() => setIsOpen(!isOpen)}>
        <span />
        <span />
        <span />
      </nav.Hamburger>
    </nav.Nav>
  )
}

export default Navbar

