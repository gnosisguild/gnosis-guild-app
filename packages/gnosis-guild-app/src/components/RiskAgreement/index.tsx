import React from "react";
import styled from "styled-components";
import { Button, Text } from "@gnosis.pm/safe-react-components";

type Props = {
  onClick: () => void;
};

const AgreementButton = styled(Button)`
  margin-right: 1rem;
  opacity: 0.8;
  background: gray;

  &&& {
    background: gray;
    color: white;
    border-radius: 0rem;
    height: 100%;
  }
`;

const RiskAgreement: React.FC<Props> = ({ onClick }) => {
  return (
    <>
      <Text size="lg" color="white">
        Guild App is a permissionless crypto subscription tool. This means
        anyone can impersonate creators. Please verify this is the correct link
        provided by creators to which you'd like to contribute.
      </Text>
      <AgreementButton size="md" onClick={onClick}>
        I understand the risk
      </AgreementButton>
    </>
  );
};

export default RiskAgreement;
