import React, { ChangeEvent, useState } from "react";
import { Text, TextField } from "@gnosis.pm/safe-react-components";
import styled from "styled-components";
import isInt from "validator/lib/isInt";
import isDecimal from "validator/lib/isDecimal";

import CurrencySelect from "../CurrencySelect";

type Props = {
  currency: string;
  setCurrency: (arg0: string) => void;
  amount: string;
  setAmount: (arg0: string) => void;
  title: string;
};

const CurrencyContainer = styled.div`
  display: flex;
  margin-top: 0.5rem;
`;

const ContributorEmailInput: React.FC<Props> = ({
  currency,
  setCurrency,
  amount,
  setAmount,
  title
}) => {
  const [meta, setMeta] = useState({});

  const updateAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMeta({});
    setAmount(val);
    if (!isInt(val) || !isDecimal(val) || parseFloat(val) < 0) {
      setMeta({ error: "Must be a valid number" });
    }
  };

  return (
    <>
      <Text size="xl" strong={true}>
        {title}
      </Text>
      <CurrencyContainer>
        <CurrencySelect activeId={currency} setActiveCurrency={setCurrency} />
        <TextField
          label="Minimum Amount"
          value={amount}
          meta={meta}
          onChange={updateAmount}
        />
      </CurrencyContainer>
    </>
  );
};

export default ContributorEmailInput;
