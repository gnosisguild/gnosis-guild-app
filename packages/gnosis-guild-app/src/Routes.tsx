import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";

import GuildApp from "./pages/GuildApp";
import GuildContribute from "./pages/GuildContribute";
import GuildContributeLink from "./pages/GuildContributeLink";
import GuildLanding from "./pages/GuildLanding";
import { SafeProvider } from "@gnosis.pm/safe-apps-react-sdk";
import { Loader, Title } from "@gnosis.pm/safe-react-components";

const Routes: React.FC = () => {
  const GuildAppPage = () => (
    <SafeProvider
      loader={
        <>
          <Title size="md">Waiting for Safe...</Title>
          <Loader size="md" />
        </>
      }
    >
      <GuildApp />
    </SafeProvider>
  );
  return (
    <Switch>
      <Route exact path="/" component={GuildAppPage} />
      <Route exact path="/guild/:guildId" component={GuildLanding} />
      <Route
        exact
        path="/guild/:guildId/contribute"
        component={GuildContribute}
      />
      <Route
        exact
        path="/guild/:guildId/contribute/link"
        component={GuildContributeLink}
      />
      <Redirect to="/" />
    </Switch>
  );
};

export default Routes;
