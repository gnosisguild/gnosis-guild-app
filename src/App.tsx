import React from "react";
import styled from "styled-components";

import CreateGuildForm from "./components/CreateGuildForm";
import GuildAppInstructions from "./components/GuildAppInstructions";

const Grid = styled.div`
  margin-bottom: 2rem;
  width: 100%;
  height: 100%;

  display: grid;
  grid-template:
    "form display" 1fr
    / 1fr 1fr;
`;

const GridDisplay = styled.div`
  grid-area: display;
`;

const App: React.FC = () => {
  return (
    <Grid>
      <CreateGuildForm />
      <GridDisplay>
        <GuildAppInstructions />
      </GridDisplay>
    </Grid>
  );
};

export default App;
