import React from 'react'
import * as s from '../globalStyles'
import { Link } from 'react-router-dom'
import logo from '../img/logo.png'

// TRAVAIL EN COURS
const NavbarCustom = ({ accounts }) => (
  <s.Navbar>
    <Link to="/">
      <img style={{float: 'left', width: 50, height: 50, margin: 5}} src={logo} alt="Logo Unlimited Evolution" />
    </Link>
    <Link to="/">
      <s.NavbarText margin={10}>Accueil</s.NavbarText>
    </Link>
    <Link to="/MyCharacters">
      <s.NavbarText margin={10}>Mes Personnages</s.NavbarText>
    </Link>
    <Link to="/MyStuff">
      <s.NavbarText margin={10}>Mon Equipement</s.NavbarText>
    </Link>
    <Link to="/MyEnemies">
      <s.NavbarText margin={10}>Mes Ennemies</s.NavbarText>
    </Link>
    <s.NavbarText float="right" margin={10}>
      {accounts !== null && accounts[0]}
    </s.NavbarText>
  </s.Navbar>
)

export default NavbarCustom
