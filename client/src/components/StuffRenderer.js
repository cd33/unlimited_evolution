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