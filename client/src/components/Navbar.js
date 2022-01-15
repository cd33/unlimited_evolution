import React, { useState } from 'react'
import * as n from'../styles/Navbar.style.js'
import logo from '../img/logoGrosTraits.png'

const Navbar = ({ accounts }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <n.Nav>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
        <n.NavLink to="/">
          <img
            style={{ width: 50, height: 50, margin: 5 }}
            src={logo}
            alt="Logo Unlimited Evolution"
          />
        </n.NavLink>
        <n.Menu isOpen={isOpen}>
          <n.NavLink to="/">
          <n.MenuLink>Accueil</n.MenuLink>
        </n.NavLink>
          <n.NavLink to="/MyCharacters">
            <n.MenuLink>Mes Personnages</n.MenuLink>
          </n.NavLink>
          <n.NavLink to="/MyStuff">
            <n.MenuLink>Mon Equipement</n.MenuLink>
          </n.NavLink>
          <n.NavLink to="/MyEnemies">
            <n.MenuLink>Mes Ennemies</n.MenuLink>
          </n.NavLink>
        </n.Menu>
      </div>
      <n.NavbarAddress margin={10} style={{color:"white"}}>
        {accounts !== null && accounts[0]}
      </n.NavbarAddress>
      <n.Hamburger onClick={() => setIsOpen(!isOpen)}>
        <span />
        <span />
        <span />
      </n.Hamburger>
    </n.Nav>
  )
}

export default Navbar

