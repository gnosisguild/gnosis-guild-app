import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { GenericModal, Loader, Title } from "@gnosis.pm/safe-react-components";

import ContributeForm from "../../components/ContributeForm";
import GridAgreementFooter from "../../components/GridAgreementFooter";
import GridLogo from "../../components/GridLogo";
import GridWallet from "../../components/GridWallet";
import GuildLogo from "../../components/GuildLogo";
import RiskAgreement from "../../components/RiskAgreement";
import ConnectWeb3Button from "../../components/ConnectWeb3Button";
import { useWeb3Context } from "../../context/Web3Context";
import { useGuildByParams } from "../../hooks/useGuildByParams";
import { useRiskAgreement } from "../../hooks/useRiskAgreement";

const Grid = styled.div`
  width: 100%;
  height: 100%;
  display: grid;
  grid-template:
    "logo form wallet" 1fr
    "footer footer footer" var(--grid-permission-footer-height)
    / 1fr 2fr 1fr;
`;

const Loading = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const GuildLoaderContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const TransactionLoader = (
  <GuildLoaderContainer>
    <Loader size="lg" />
  </GuildLoaderContainer>
);

const GuildContribute: React.FC = () => {
  const { getConnectText, connected } = useWeb3Context();
  const { riskAgreement, setRiskAgreement } = useRiskAgreement();

  const { loading, guild } = useGuildByParams();
  const [submit, toggleSubmit] = useState(false);
  const [clear, setClear] = useState(false);

  const [footerMsg, setFooterMsg] = useState("");

  const connectText = getConnectText();
  const onDisconnect = () => {
    setClear(true);
  };
  useEffect(() => {
    if (connected) {
      setClear(false);
    }
  }, [connected]);
  return (
    <Grid>
      <GridLogo>
        <GuildLogo />
      </GridLogo>
      {guild.name ? (
        <ContributeForm
          disabled={!riskAgreement}
          setModalFooter={setFooterMsg}
          toggleSubmit={toggleSubmit}
          clear={clear}
        />
      ) : (
        <Loading>
          {loading ? (
            <Loader size="md" />
          ) : (
            <Title size="sm" strong={true}>
              404: Guild not found
            </Title>
          )}
        </Loading>
      )}
      <GridWallet>
        <ConnectWeb3Button onDisconnect={onDisconnect}>
          {connectText}
        </ConnectWeb3Button>
      </GridWallet>
      <GridAgreementFooter visible={!riskAgreement}>
        <RiskAgreement onClick={setRiskAgreement} />
      </GridAgreementFooter>
      {submit && (
        <GenericModal
          onClose={() => toggleSubmit(!submit)}
          title="Executing Transaction"
          body={TransactionLoader}
          footer={footerMsg}
        />
      )}
    </Grid>
  );
};

export default GuildContribute;
