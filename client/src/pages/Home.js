import React from 'react'
import NavbarCustom from '../components/Navbar'
import SocialNetwork from '../components/SocialNetwork'
import TextDynamic from '../components/TextDynamic'
import logo from '../img/logo.png'
import '../style/Navbar.css'
import '../style/Texte.css'
import * as s from '../globalStyles'

const Home = ({ accounts }) => {
  return (
    <div className="home">
      

      {/* // <div>
    //   <s.Navbar ai="center" jc="center">
    //     <img className="logo" style={{float:"left"}} src={logo} />
    //     <s.NavbarText float="left" margin={10}>
    //       Mes Personnages
    //     </s.NavbarText>
    //     <s.NavbarText float="left" margin={10}>
    //       Mes Ennemies
    //     </s.NavbarText>
    //     <s.NavbarText float="right" margin={10}>
    //       {accounts !== null && accounts[0]}
    //     </s.NavbarText>
    //   </s.Navbar> */}

      <TextDynamic />
    </div>
    // </div>
  )
}

export default Home
