import styled from "styled-components";

const GridItem = styled.div`
  grid-area: logo;
`;

const GridLogo: React.FC = ({ children }) => {
  return <GridItem>{children}</GridItem>;
};

export default GridLogo;
