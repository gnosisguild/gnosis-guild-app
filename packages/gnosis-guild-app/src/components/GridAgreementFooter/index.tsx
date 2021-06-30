import React from "react";
import styled from "styled-components";

type Props = {
  visible?: boolean;
};

const Footer = styled.div<Props>`
  grid-area: footer;
  background: black;
  padding-left: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  visibility: ${(props) => (props.visible ? "visible" : "hidden	")};
`;

const GridFooter: React.FC<Props> = ({ visible, children }) => {
  return <Footer visible={visible}>{children}</Footer>;
};

export default GridFooter;
