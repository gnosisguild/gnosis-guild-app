import React, { ChangeEvent, useState } from "react";
import { Text, TextField } from "@gnosis.pm/safe-react-components";
import isEmail from "validator/lib/isEmail";

type Props = {
  email: string;
  setContributorEmail: (arg0: string) => void;
  setInvalidForm: (arg0: boolean) => void;
};

const ContributorEmailInput: React.FC<Props> = ({
  email,
  setContributorEmail,
  setInvalidForm
}) => {
  const [meta, setMeta] = useState({});

  const updateGuildEmail = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMeta({});
    setContributorEmail(val);
    if (val && !isEmail(val)) {
      setMeta({ error: "Must be a valid email" });
      setInvalidForm(true);
    } else {
      setInvalidForm(false);
    }
  };

  return (
    <>
      <Text size="xl" strong={true}>
        Email
      </Text>
      <TextField
        label="200 characters"
        meta={meta}
        value={email}
        onChange={updateGuildEmail}
      />
    </>
  );
};

export default ContributorEmailInput;
