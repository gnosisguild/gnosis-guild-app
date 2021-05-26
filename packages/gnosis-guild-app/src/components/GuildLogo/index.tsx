import React from "react";
import styled from "styled-components";

import guildLogo from "../../assets/guildlogo.png";

const Logo = styled.img`
  height: 6rem;
`;

type Props = {
  className?: string;
};

const GuildLogo: React.FC<Props> = ({ className }) => {
  return <Logo className={className} src={guildLogo} alt="gnosis guild" />;
};

export default GuildLogo;
