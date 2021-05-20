import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import GuildApp from "./pages/GuildApp";
import GuildLanding from "./pages/GuildLanding";

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={GuildApp} />
      <Route exact path="/guild/:guildId" component={GuildLanding} />
      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
