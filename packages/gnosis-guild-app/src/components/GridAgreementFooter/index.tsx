import React from "react";
import styled from "styled-components";

const Footer = styled.div`
  grid-area: footer;
  background: black;
  padding-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const GridFooter: React.FC = ({ children }) => {
  return <Footer>{children}</Footer>;
};

export default GridFooter;
