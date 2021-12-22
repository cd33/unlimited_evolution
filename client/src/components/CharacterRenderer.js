import React from "react";
import parts from "./parts";

const CharacterRenderer = ({ character = null, size, style }) => {
  if (!character) {
    return null;
  }

  let dnaStr = String(character.dna);

  while (dnaStr.length < 16) dnaStr = "0" + dnaStr;

  const attribution = (dna, first, end) => { // 50%, 35%, 10% et 5%
    let res = dna.substring(first, end) % 20
    if (res === 0) return 0;
    if (res === 1 || res === 2) return 1
    if (res > 2 && res < 10) return 2
    if (res > 9 && res < 20) return 3
  }

  // TESTS
  // console.log("dna: ", dnaStr)
  // console.log(attribution(dnaStr, 2, 4))
  // console.log(attribution(dnaStr, 4, 6))
  // console.log(attribution(dnaStr, 6, 8))
  // console.log(attribution(dnaStr, 8, 10))
  // console.log(attribution(dnaStr, 10, 12))

  let characterDetails = {
    bg: character.typeCharacter,
    hair: attribution(dnaStr, 2, 4),
    head: attribution(dnaStr, 4, 6),
    upbody: attribution(dnaStr, 6, 8),
    lowbody: attribution(dnaStr, 8, 10),
    shoes: attribution(dnaStr, 10, 12),
  };

  const characterStyle = {
    width: "100%",
    height: "100%",
    position: "absolute",
  };

  return (
    <div
      style={{
        minWidth: size,
        minHeight: size,
        background: "blue",
        position: "relative",
        ...style,
      }}
    >
      <img alt={"bg"} src={parts.bg[characterDetails.bg]} style={characterStyle} />
      <img alt={"hair"} src={parts.hair[characterDetails.hair]} style={characterStyle} />
      <img alt={"head"} src={parts.head[characterDetails.head]} style={characterStyle} />
      <img alt={"upbody"} src={parts.upbody[characterDetails.upbody]} style={characterStyle} />
      <img alt={"lowbody"} src={parts.lowbody[characterDetails.lowbody]} style={characterStyle} />
      <img alt={"shoes"} src={parts.shoes[characterDetails.shoes]} style={characterStyle} />
    </div>
  );
};

export default CharacterRenderer;