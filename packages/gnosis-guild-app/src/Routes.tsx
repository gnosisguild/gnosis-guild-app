import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import { theme, Loader, Title } from "@gnosis.pm/safe-react-components";
import SafeProvider from "@gnosis.pm/safe-apps-react-sdk";
import GuildApp from "./pages/GuildApp";
import GuildLanding from "./pages/GuildLanding";

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={GuildApp} />
      <Route exact path="/guild" component={GuildLanding} />
      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
