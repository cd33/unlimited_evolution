import React from 'react'
import { Link } from 'react-router-dom'
import * as s from '../globalStyles'
import "../style/Navbar.css"
import logo from '../img/logo.png'

const NavbarCustom = ({ accounts }) => {
  return (
    <div className="navBar">
      <Link to="/">
        <img className="logo" src={logo} alt="Logo Unlimited Evolution" />
      </Link>
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/">Accueil</Link>
              </li>
              <li className="nav-item">
                <Link to="/MyCharacters">Mes Personnages</Link>
              </li>
              <li className="nav-item">
                <Link to="/MyStuff">Mon Equipement</Link>
              </li>
              <li className="nav-item">
                <Link to="/MyEnemies">Mes Ennemies</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <s.NavbarText float="right" margin={10} style={{ color: 'white' }}>
        {accounts !== null && accounts[0]}
      </s.NavbarText>
    </div>
  )
}

export default NavbarCustom
