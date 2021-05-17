import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { theme, Loader, Title } from "@gnosis.pm/safe-react-components";
import SafeProvider from "@gnosis.pm/safe-apps-react-sdk";

import GlobalStyle from "./GlobalStyle";
import Routes from "./Routes";
import { GuildProvider } from "./context/GuildContext";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <SafeProvider
          loader={
            <>
              <Title size="md">Waiting for Safe...</Title>
              <Loader size="md" />
            </>
          }
        >
          <GuildProvider>
            <Routes />
          </GuildProvider>
        </SafeProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
