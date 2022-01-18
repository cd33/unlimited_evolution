import React from "react";
import s_1 from "../img/stuffs/swordBasic.png";
import s_2 from "../img/stuffs/shieldBasic.png";
import s_3 from "../img/stuffs/swordExcalibur.png";
import s_4 from "../img/stuffs/shieldAegis.png";
import s_5 from "../img/stuffs/potion.png";

const StuffRenderer = ({ stuffId, size, style }) => {
  const stuffs = ["", s_1, s_2, s_3, s_4, s_5,]

  const stuffStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
  };

  return (
    <div
      style={{
        minWidth: size,
        minHeight: size,
        position: "relative",
        marginBottom: 10,
        ...style,
      }}
    >
      <img alt={"bg"} src={stuffs[stuffId]} style={stuffStyle} />
    </div>
  );
};

export default StuffRenderer;

// import React, { useState, useRef } from 'react'
// import classnames from 'classnames'
// import { useIntersection } from './intersectionObserver'
// import '../styles/imageRenderer.scss'

// const StuffRenderer = ({ stuffId, size, style }) => {

//   const stuffStyle = {
//     width: "100%",
//     height: "100%",
//     position: "absolute",
//   };

//   const ImageRenderer = ({ url, thumb, width, height }) => {
//     const [isLoaded, setIsLoaded] = useState(false)
//     const [isInView, setIsInView] = useState(false)
//     const imgRef = useRef()
//     useIntersection(imgRef, () => {
//       setIsInView(true)
//     })

//     const handleOnLoad = () => {
//       setIsLoaded(true)
//     }
//     return (
//       <div
//         className="image-container"
//         ref={imgRef}
//         style={{
//           paddingBottom: `${(height / width) * 100}%`,
//           width: '100%',
//         }}
//       >
//         {isInView && (
//           <>
//             <img
//               className={classnames('image', 'thumb', {
//                 ['isLoaded']: !!isLoaded
//               })}
//               src={thumb}
//             />
//             <img
//               className={classnames('image', {
//                 ['isLoaded']: !!isLoaded,
//               })}
//               src={url}
//               onLoad={handleOnLoad}
//               stle={stuffStyle}
//             />
//           </>
//         )}
//       </div>
//     )
//   }

//   return (
//     <div
//       style={{
//         minWidth: size,
//         minHeight: size,
//         position: "relative",
//         marginBottom: 10,
//         ...style,
//       }}
//     >
//       <ImageRenderer
//         key={stuffId}
//         url={`https://gateway.pinata.cloud/ipfs/QmZEC9RAZ2bLdgdXEg3x2zno4Cq62SzMMZbjCyvgkP3KxG/${stuffId}.png`}
//         thumb={`https://gateway.pinata.cloud/ipfs/QmZEC9RAZ2bLdgdXEg3x2zno4Cq62SzMMZbjCyvgkP3KxG/${stuffId}.png`}
//         width={size}
//         height={size}
//       />

//     </div>
//   );
// };

// export default StuffRenderer;