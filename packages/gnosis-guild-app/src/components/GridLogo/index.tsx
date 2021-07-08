import React from "react";
import styled from "styled-components";

const GridItem = styled.div`
  grid-area: logo;
`;

const GridLogo: React.FC = ({ children }) => <GridItem>{children}</GridItem>;

export default GridLogo;
