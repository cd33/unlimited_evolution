import React from 'react'
import * as s from '../globalStyles'

const SocialNetwork = ({accounts}) => {
  const anim = () => {
    let Navbar = document.querySelectorAll('.social-network .navigation a')

    Navbar.forEach((link) => {
      link.addEventListener('mouseover', (e) => {
        let attrX = e.offsetX - 20
        let attrY = e.offsetY - 13

        link.style.transform = `translate( ${attrX}px, ${attrY}px)`
      })
      link.addEventListener('mouseleave', () => {
        link.style.transform = ''
      })
    })
  }

  return (
    <div>
        <s.NavbarText float="right" margin={10}>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="
                "
            onMouseOver={anim}
          >
            <li>
              <i className="fab fa-facebook-f"></i>
            </li>
          </a>
        </s.NavbarText>
        <s.NavbarText float="right" margin={10}>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover"
            onMouseOver={anim}
          >
            <li>
              <i className="fab fa-twitter"></i>
            </li>
          </a>
        </s.NavbarText>
        <s.NavbarText float="right" margin={10}>
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover"
            onMouseOver={anim}
          >
            <li>
              <i className="fab fa-instagram"></i>
            </li>
          </a>
        </s.NavbarText>
        <s.NavbarText float="right" margin={10} style={{color: "white"}}>
          {accounts !== null && accounts[0]}
        </s.NavbarText>
    </div>
  )
}

export default SocialNetwork
