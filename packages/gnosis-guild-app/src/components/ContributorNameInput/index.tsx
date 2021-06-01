import React, { ChangeEvent, useState } from "react";
import { Text, TextField } from "@gnosis.pm/safe-react-components";

type Props = {
  name: string;
  setContributorName: (arg0: string) => void;
};

const ContributorNameInput: React.FC<Props> = ({
  name,
  setContributorName
}) => {
  const [meta, setMeta] = useState({});

  const updateGuildName = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMeta({});
    setContributorName(val);
    if (val && val.length > 50) {
      setMeta({ error: "Name must be less than 50 characters" });
    }
  };

  return (
    <>
      <Text size="xl" strong={true}>
        Name
      </Text>
      <TextField
        label="50 characters"
        meta={meta}
        value={name}
        onChange={updateGuildName}
      />
    </>
  );
};

export default ContributorNameInput;
