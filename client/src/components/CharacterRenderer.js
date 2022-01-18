import React, { useState, useRef } from 'react'
import classnames from 'classnames'
import { useIntersection } from './intersectionObserver'
import '../styles/imageRenderer.scss'
import s_1 from "../img/assetsStuffs/swordBasic.png";
import s_2 from "../img/assetsStuffs/shieldBasic.png";
import s_3 from "../img/assetsStuffs/swordExcalibur.png";
import s_4 from "../img/assetsStuffs/shieldAegis.png";

const parts = {
  stuffs: ["", s_1, s_2, s_3, s_4]
};

const CharacterRenderer = ({ character = null, size, style }) => {
  const characterStyle = {
    width: '100%',
    height: '100%',
    position: 'absolute',
  }

  const ImageRenderer = ({ url, thumb, width, height }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(false)
    const imgRef = useRef()
    useIntersection(imgRef, () => {
      setIsInView(true)
    })

    const handleOnLoad = () => {
      setIsLoaded(true)
    }
    return (
      <div
        className="image-container"
        ref={imgRef}
        style={{
          paddingBottom: `${(height / width) * 100}%`,
          width: '100%',
        }}
      >
        {isInView && (
          <>
            <img
              className={classnames('image', 'thumb', {
                ['isLoaded']: !!isLoaded,
              })}
              alt={'nft_thumb'}
              src={thumb}
              style={characterStyle}
            />
            <img
              className={classnames('image', {
                ['isLoaded']: !!isLoaded,
              })}
              alt={'nft'}
              src={url}
              onLoad={handleOnLoad}
              style={characterStyle}
            />
            {character.weapon !== '0' && (
              <img
                alt={'weapon'}
                src={parts.stuffs[character.weapon]}
                style={characterStyle}
              />
            )}
            {character.shield !== '0' && (
              <img
                alt={'shield'}
                src={parts.stuffs[character.shield]}
                style={characterStyle}
              />
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div
      style={{
        minWidth: size,
        minHeight: size,
        position: 'relative',
        ...style,
      }}
    >
      <ImageRenderer
        key={character.id}
        url={`https://gateway.pinata.cloud/ipfs/QmZEC9RAZ2bLdgdXEg3x2zno4Cq62SzMMZbjCyvgkP3KxG/${character.id}.png`}
        thumb={`https://gateway.pinata.cloud/ipfs/QmZEC9RAZ2bLdgdXEg3x2zno4Cq62SzMMZbjCyvgkP3KxG/${character.id}.png`}
        width={size}
        height={size}
      />
    </div>
  )
}

export default CharacterRenderer