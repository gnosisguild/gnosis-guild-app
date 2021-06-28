import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { theme } from "@gnosis.pm/safe-react-components";

import { GuildProvider } from "./context/GuildContext";
import { Web3ContextProvider } from "./context/Web3Context";
import GlobalStyle from "./GlobalStyle";
import Routes from "./Routes";
import { HashRouter as Router } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <Web3ContextProvider>
          <GuildProvider>
            <GlobalStyle />
            <Routes />
          </GuildProvider>
        </Web3ContextProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
