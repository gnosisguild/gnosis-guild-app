import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "styled-components";
import { theme, Loader, Title } from "@gnosis.pm/safe-react-components";

import GlobalStyle from "./GlobalStyle";
import Routes from "./Routes";
import { BrowserRouter as Router } from "react-router-dom";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Routes />
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
