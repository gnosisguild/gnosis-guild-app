import React from "react";
import styled from "styled-components";

import guildLogo from "../../assets/guildlogo.png";

const Logo = styled.img`
  height: 6rem;
`;

const GuildLogo: React.FC = () => {
  return <Logo src={guildLogo} alt="gnosis guild" />;
};

export default GuildLogo;
