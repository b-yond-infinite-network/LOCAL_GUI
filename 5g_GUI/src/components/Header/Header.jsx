// components/Header/Header.jsx
import React from "react";


const Header = ({ headerTitle }) => {
  return (
    <header>
      <div className="container">
        <div className="main-header">
          <h1>{headerTitle}</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
