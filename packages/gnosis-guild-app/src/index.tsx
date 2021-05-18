import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { theme, Loader, Title } from "@gnosis.pm/safe-react-components";

import { GuildProvider } from "./context/GuildContext";
import GlobalStyle from "./GlobalStyle";
import Routes from "./Routes";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <GuildProvider>
          <GlobalStyle />
          <Routes />
        </GuildProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
