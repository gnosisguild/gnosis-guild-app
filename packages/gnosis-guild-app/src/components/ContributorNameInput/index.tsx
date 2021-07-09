import React, { ChangeEvent, useState } from "react";
import { Text, TextField } from "@gnosis.pm/safe-react-components";

type Props = {
  name: string;
  setContributorName: (arg0: string) => void;
  setInvalidForm: (arg0: boolean) => void;
  disabled: boolean;
};

const ContributorNameInput: React.FC<Props> = ({
  name,
  setContributorName,
  setInvalidForm,
  disabled,
}) => {
  const [meta, setMeta] = useState({});

  const updateGuildName = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMeta({});
    setContributorName(val);
    if (val && val.length > 50) {
      setMeta({ error: "Name must be less than 50 characters" });
      setInvalidForm(true);
    } else {
      setInvalidForm(false);
    }
    if (!val) {
      setInvalidForm(true);
    }
  };

  return (
    <>
      <Text size="xl" strong>
        Name
      </Text>
      <TextField
        label="50 characters"
        meta={meta}
        value={name}
        onChange={updateGuildName}
        readOnly={disabled}
      />
    </>
  );
};

export default ContributorNameInput;
