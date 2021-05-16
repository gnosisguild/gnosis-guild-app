import React, {
  useState,
  useCallback,
  useRef,
  MouseEvent,
  useEffect,
} from "react";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import styled from "styled-components";
import {
  Button,
  Select,
  Text,
  TextField,
} from "@gnosis.pm/safe-react-components";

import { useGuildContext } from "../../context/GuildContext";

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
  const { guildMetadata, setGuildMetadata } = useGuildContext();

  const { sdk, safe } = useSafeAppsSDK();
  const [submitting, setSubmitting] = useState(false);
  // Input values
  const [guildName, setGuildName] = useState(guildMetadata.name);
  const [guildDescription, setGuildDescription] = useState(
    guildMetadata.description
  );
  const [contentFormat, setContentFormat] = useState(
    guildMetadata.contentFormat
  );
  const [guildExternalLink, setGuildExternalLink] = useState(
    guildMetadata.externalLink
  );

  const [guildImage, setGuildImage] = useState(guildMetadata.image);
  const hiddenImageInput = useRef<HTMLInputElement>(null);

  const [activeCurrency, setActiveCurrency] = useState(
    guildMetadata.contributions
  );

  useEffect(() => {
    setGuildName(guildMetadata.name);
    setGuildDescription(guildMetadata.description);
    setContentFormat(guildMetadata.contentFormat);
    setGuildExternalLink(guildMetadata.externalLink);
    setGuildImage(guildMetadata.image);
    setActiveCurrency(guildMetadata.contributions);
  }, [guildMetadata]);

  const selectItems = [
    { id: "ETH", label: "ETH", subLabel: "Minimum amount 0.1" },
    { id: "DAI", label: "Dai", subLabel: "Minimum amount 20" },
  ];

  const changeCurrency = (id: string) => {
    if (id === "ETH" || id === "DAI") {
      setActiveCurrency(id);
    } else {
      console.error("Incorrect currency passed in");
    }
  };

  // TODO: Implement acutal logic below
  // The current logic is incomplete
  const uploadImage = (e: MouseEvent<HTMLInputElement>) => {
    console.log(e);
  };

  const clickImageInput = (e: MouseEvent<HTMLButtonElement>) => {
    hiddenImageInput?.current?.click();
  };

  // TODO: Modify to implement correct logic
  // Curently placeholder logic
  const submitTx = useCallback(async () => {
    setSubmitting(true);
    try {
			// Safe app example
      //const { safeTxHash } = await sdk.txs.send({
      //  txs: [
      //    {
      //      to: safe.safeAddress,
      //      value: "0",
      //      data: "0x",
      //    },
      //  ],
      //});
      //console.log({ safeTxHash });
      //const safeTx = await sdk.txs.getBySafeTxHash(safeTxHash);
      //console.log({ safeTx });
      console.log("Submitting");
    } catch (e) {
      console.error(e);
    }
    setGuildMetadata({
      name: guildName,
      description: guildDescription,
      contentFormat: contentFormat,
      externalLink: guildExternalLink,
      image: guildImage,
      contributions: activeCurrency,
    });
    setSubmitting(false);
  }, [safe, sdk]);

  // Upload text
  const imageUploadText = guildMetadata.description
    ? "Replace Image"
    : "Upload Image";
  const guildButtonText = guildMetadata.name ? "Update Guild" : "Create Guild";

  return (
    <GridForm noValidate autoComplete="off" onSubmit={submitTx}>
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
          onClick={clickImageInput}
        >
          {imageUploadText}
        </Button>
        <input
          type="file"
          ref={hiddenImageInput}
          style={{ display: "none" }}
          onClick={uploadImage}
        />
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
        <ButtonContainer>
          <Button
            size="lg"
            color="secondary"
            onClick={() => {
              setSubmitting(false);
            }}
          >
            Cancel
          </Button>
        </ButtonContainer>
      ) : (
        <ButtonContainer>
          <Button
            size="lg"
            color="primary"
            variant="contained"
            onClick={submitTx}
          >
            {guildButtonText}
          </Button>
        </ButtonContainer>
      )}
    </GridForm>
  );
};

export default CreateGuildForm;
