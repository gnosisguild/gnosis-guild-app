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
  dropdown?: boolean;
  disabled?: boolean;
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
  title,
  dropdown = true,
  disabled = false
}) => {
  const [meta, setMeta] = useState({});

  const updateAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMeta({});
    setAmount(val);
    if ((!isInt(val) && !isDecimal(val)) || parseFloat(val) < 0) {
      setMeta({ error: "Must be a valid number" });
    }
  };
  let currencyIndicator;
  let currencyName = ` (${currency})`;
  if (dropdown) {
    currencyIndicator = (
      <CurrencySelect activeId={currency} setActiveCurrency={setCurrency} />
    );
    currencyName = "";
  }

  return (
    <>
      <Text size="xl" strong={true}>
        {title}
      </Text>
      <CurrencyContainer>
        {currencyIndicator}
        <TextField
          label={`Minimum Amount${currencyName}`}
          value={amount}
          meta={meta}
          onChange={updateAmount}
          readOnly={disabled}
        />
      </CurrencyContainer>
    </>
  );
};

export default ContributorEmailInput;
