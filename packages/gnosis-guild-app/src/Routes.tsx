import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import GuildApp from "./pages/GuildApp";

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={GuildApp} />
      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
