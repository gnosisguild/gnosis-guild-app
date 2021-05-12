import React, { useState, useCallback } from "react";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import styled from "styled-components";
import {
  Button,
  Loader,
  Select,
  Text,
  TextField,
} from "@gnosis.pm/safe-react-components";

const GridForm = styled.form`
  grid-area: form;
  margin: 0.4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 600px;
`;

const FormItem = styled.div`
  margin: 0.4rem;
`;

const ButtonContainer = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
`;

const CreateGuildForm: React.FC = () => {
  const { sdk, safe } = useSafeAppsSDK();
  const [submitting, setSubmitting] = useState(false);
  // Input values
  const [guildName, setGuildName] = useState("");
  const [guildDescription, setGuildDescription] = useState("");
  const [contentFormat, setContentFormat] = useState("");
  const [guildExternalLink, setGuildExternalLink] = useState("");

  const [activeCurrency, setActiveCurrency] = useState("1");
  const selectItems = [
    { id: "1", label: "ETH", subLabel: "Minimum amount 0.1" },
    { id: "2", label: "Dai", subLabel: "Minimum amount 20" },
  ];

  const changeCurrency = (id: string) => {
    setActiveCurrency(id);
  };

  const submitTx = useCallback(async () => {
    setSubmitting(true);
    try {
      const { safeTxHash } = await sdk.txs.send({
        txs: [
          {
            to: safe.safeAddress,
            value: "0",
            data: "0x",
          },
        ],
      });
      console.log({ safeTxHash });
      const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
      console.log({ safeTx });
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  }, [safe, sdk]);

  return (
    <GridForm>
      <FormItem>
        <Text size="xl" strong={true}>
          Guild Name
        </Text>
        <TextField
          label="50 characters"
          value={guildName}
          onChange={(e) => setGuildName(e.target.value)}
        />
      </FormItem>
      <FormItem>
        <Text size="xl" strong={true}>
          Guild Description
        </Text>
        <TextField
          label="200 characters"
          value={guildDescription}
          onChange={(e) => setGuildDescription(e.target.value)}
        />
      </FormItem>
      <FormItem>
        <Text size="xl" strong={true}>
          Content Format for Contributors
        </Text>
        <TextField
          label="E.g. Algorithm-free curation, Design Weekly	Newsletter, Discord"
          value={contentFormat}
          onChange={(e) => setContentFormat(e.target.value)}
        />
      </FormItem>
      <FormItem>
        <Text size="xl" strong={true}>
          Guild External Link
        </Text>
        <TextField
          label="https://guild.is/"
          value={guildExternalLink}
          onChange={(e) => setGuildExternalLink(e.target.value)}
        />
      </FormItem>
      <ButtonContainer>
        <Button
          color={"secondary"}
          fullWidth={false}
          size="md"
          variant="contained"
        >
          Upload Image
        </Button>
      </ButtonContainer>
      <FormItem>
        <Text size="xl" strong={true}>
          Monthly Contributors
        </Text>
        <Select
          activeItemId={activeCurrency}
          items={selectItems}
          onItemClick={changeCurrency}
        />
      </FormItem>
      {submitting ? (
        <>
          <Loader size="md" />
          <br />
          <Button
            size="lg"
            color="secondary"
            onClick={() => {
              setSubmitting(false);
            }}
          >
            Cancel
          </Button>
        </>
      ) : (
        <ButtonContainer>
          <Button
            size="lg"
            color="primary"
            variant="contained"
            onClick={submitTx}
          >
            Create Guild
          </Button>
        </ButtonContainer>
      )}
    </GridForm>
  );
};

export default CreateGuildForm;
