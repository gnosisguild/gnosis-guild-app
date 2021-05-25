import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import GuildApp from "./pages/GuildApp";
import GuildContribute from "./pages/GuildContribute";
import GuildLanding from "./pages/GuildLanding";

const Routes: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/" component={GuildApp} />
      <Route exact path="/guild/:guildId" component={GuildLanding} />
      <Route
        exact
        path="/guild/:guildId/contribute"
        component={GuildContribute}
      />
      <Route
        exact
        path="/guild/:guildId/contribute/link"
        component={GuildContribute}
      />
      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
