import React, { ChangeEvent, useState } from "react";
import { Text, TextField, Tooltip } from "@gnosis.pm/safe-react-components";
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
  setInvalidForm: (arg0: boolean) => void;
  dropdown?: boolean;
  disabled?: boolean;
  minimum?: string;
};

const CurrencyContainer = styled.div`
  display: flex;
  margin-top: 0.5rem;
`;

const AmountInput: React.FC<Props> = ({
  currency,
  setCurrency,
  amount,
  setAmount,
  title,
  setInvalidForm,
  dropdown = true,
  disabled = false,
  minimum = 0,
}) => {
  const [meta, setMeta] = useState({});

  const updateAmount = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMeta({});
    setAmount(val);
    if (
      (!isInt(val) && !isDecimal(val)) ||
      parseFloat(val) <= 0 ||
      parseFloat(val) < minimum
    ) {
      setInvalidForm(true);
      setMeta({ error: "Must be a valid number" });
      if (minimum) {
        setMeta({ error: `Must be a valid amount (>= ${minimum})` });
      }
    } else {
      setInvalidForm(false);
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
  let label = `Minimum Amount${currencyName}`;
  if (minimum) {
    label = `Minimum Amount to contribute ${minimum} ${currencyName}`;
  }

  return (
    <>
      <div>
        <Text size="xl" strong={true}>
          {title}
        </Text>
      </div>
      <CurrencyContainer>
        {currencyIndicator}
        <TextField
          label={label}
          value={amount}
          meta={meta}
          onChange={updateAmount}
          readOnly={disabled}
        />
      </CurrencyContainer>
    </>
  );
};

export default AmountInput;
