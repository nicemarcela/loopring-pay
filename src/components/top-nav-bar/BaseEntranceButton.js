import { ThemeContext } from "styled-components";

import React, { useContext } from "react";

import AppLayout from "AppLayout";

const BaseEntranceButton = ({
  icon,
  spin,
  title,
  color,
  backgroundcolor,
  onMouseEnter,
}) => {
  const theme = useContext(ThemeContext);
  return (
    <button onMouseEnter={onMouseEnter} type="button" className="btn btn-lg btn-outline-primary text-white">
      {title}
    </button> 
  );
};

export default BaseEntranceButton;
