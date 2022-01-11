import React from 'react'
import { Link } from 'react-router-dom'

// TODO: REVOIR
const NavbarCustom = () => {
  return (
    <div>
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
              <li className="nav-item">
                <Link to="/ManageStuff">Acheter/Gerer Equipement</Link>
              </li>
              {/* <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  id="navbarDropdownMenuLink"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Personnages
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="navbarDropdownMenuLink"
                >
                  <li>
                    <a className="dropdown-item" href="../pages/MesPerso.js">
                      Mes Personnages
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="../pages/MesEnnemie.js">
                      Mes Ennemies
                    </a>
                  </li>
                </ul>
              </li> */}
            </ul>
          </div>
          {/* <s.NavbarText float="right" margin={10}>{accounts !== null && accounts[0]}</s.NavbarText> */}
        </div>
      </nav>
    </div>
  )
}

export default NavbarCustom

// import React from 'react'
// import * as s from '../globalStyles'

// const NavbarCustom = ({ accounts }) => {
//   return (
//     <s.Navbar>
//       <s.NavbarText float="right" margin={10}>
//         Mes Personnages
//       </s.NavbarText>
//       <s.NavbarText float="right" margin={10}>
//         Mes Ennemies
//       </s.NavbarText>
//       <s.NavbarText float="right" margin={10}>
//         {accounts !== null && accounts[0]}
//       </s.NavbarText>
//     </s.Navbar>
//   )
// }

// export default NavbarCustom
