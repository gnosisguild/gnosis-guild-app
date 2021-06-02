import React, {
  useState,
  useRef,
  MouseEvent,
  ChangeEvent,
  useEffect
} from "react";
import styled from "styled-components";
import isURL from "validator/lib/isURL";
import { Button, Text, TextField } from "@gnosis.pm/safe-react-components";

import AmountInput from "../AmountInput";
import { useGuildContext } from "../../context/GuildContext";
import { useWeb3Context } from "../../context/Web3Context";
import { useGuild } from "../../hooks/useGuild";

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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
`;

const DeleteButton = styled(Button)`
  &&& {
    min-width: 0rem;
  }
`;

const CreateGuildForm: React.FC = () => {
  const { guildMetadata, setGuildMetadata } = useGuildContext();

  const { ethersProvider, account, providerChainId } = useWeb3Context();
  const { createGuild, deactivateGuild } = useGuild();
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

  const [guildMinimumAmount, setGuildMinimumAmount] = useState(
    guildMetadata.amount.toString()
  );

  //
  // Input error states
  const [guildNameMeta, setGuildNameMeta] = useState({});
  const [guildDescriptionMeta, setGuildDescriptionMeta] = useState({});
  const [guildExternalLinkMeta, setGuildExternalLinkMeta] = useState({});
  const [guildContentFormatMeta, setGuildContentFormatMeta] = useState({});

  const [guildImage, setGuildImage] = useState(guildMetadata.image);
  const hiddenImageInput = useRef<HTMLInputElement>(null);

  const [activeCurrency, setActiveCurrency] = useState(guildMetadata.currency);

  useEffect(() => {
    setGuildName(guildMetadata.name);
    setGuildDescription(guildMetadata.description);
    setContentFormat(guildMetadata.contentFormat);
    setGuildExternalLink(guildMetadata.externalLink);
    setGuildImage(guildMetadata.image);
    setActiveCurrency(guildMetadata.currency);
  }, [guildMetadata]);

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
  const submitTx = async (): Promise<void> => {
    setSubmitting(true);
    try {
      // Create guild
      const guildInfo = {
        name: guildName,
        description: guildDescription,
        contentFormat: contentFormat,
        externalLink: guildExternalLink,
        image: guildImage,
        currency: activeCurrency,
        amount: 0
      };
      createGuild(providerChainId, ethersProvider, guildInfo, account);
    } catch (e) {
      console.error(e);
    }
    setGuildMetadata({
      name: guildName,
      description: guildDescription,
      contentFormat: contentFormat,
      externalLink: guildExternalLink,
      image: guildImage,
      currency: activeCurrency,
      amount: 0
    });
    setSubmitting(false);
  };

  // Upload text
  const imageUploadText = guildMetadata.description
    ? "Replace Image"
    : "Upload Image";
  const guildButtonText = guildMetadata.name ? "Update Guild" : "Create Guild";

  const updateGuildName = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildNameMeta({});
    setGuildName(val);
    if (val && val.length > 50) {
      setGuildNameMeta({ error: "Name must be less than 50 characters" });
    }
  };

  const updateGuildDescription = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildDescriptionMeta({});
    setGuildDescription(val);
    if (val && val.length > 200) {
      setGuildDescriptionMeta({
        error: "Description must be less than 200 characters"
      });
    }
  };

  const updateGuildExternalLink = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildExternalLinkMeta({});
    setGuildExternalLink(val);
    if (val && !isURL(val)) {
      setGuildExternalLinkMeta({
        error: "Guild external link must be a valid Url"
      });
    }
  };

  const updateGuildContentFormat = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildContentFormatMeta({});
    setContentFormat(val);
    if (val && val.length > 200) {
      setGuildContentFormatMeta({
        error: "Must be less than 200 characters"
      });
    }
  };

  const pauseGuild = (e: MouseEvent<HTMLButtonElement>) => {
    deactivateGuild(providerChainId, ethersProvider, account);
  };

  const deleteButton = guildMetadata.name ? (
    <DeleteButton
      size="lg"
      color="error"
      variant="contained"
      onClick={pauseGuild}
    >
      Delete Guild
    </DeleteButton>
  ) : (
    <p />
  );

  return (
    <GridForm noValidate>
      <FormItem>
        <Text size="xl" strong={true}>
          Guild Name
        </Text>
        <TextField
          label="50 characters"
          value={guildName}
          meta={guildNameMeta}
          onChange={updateGuildName}
        />
      </FormItem>
      <FormItem>
        <Text size="xl" strong={true}>
          Guild Description
        </Text>
        <TextField
          label="200 characters"
          value={guildDescription}
          meta={guildDescriptionMeta}
          onChange={updateGuildDescription}
        />
      </FormItem>
      <FormItem>
        <Text size="xl" strong={true}>
          Content Format for Contributors
        </Text>
        <TextField
          label="E.g. Algorithm-free curation, Design Weekly	Newsletter, Discord"
          meta={guildContentFormatMeta}
          value={contentFormat}
          onChange={updateGuildContentFormat}
        />
      </FormItem>
      <FormItem>
        <Text size="xl" strong={true}>
          Guild External Link
        </Text>
        <TextField
          label="https://guild.is/"
          value={guildExternalLink}
          meta={guildExternalLinkMeta}
          onChange={updateGuildExternalLink}
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
        <AmountInput
          title="Monthly Contributors"
          currency={activeCurrency}
          setCurrency={setActiveCurrency}
          amount={guildMinimumAmount}
          setAmount={setGuildMinimumAmount}
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
          {deleteButton}
        </ButtonContainer>
      )}
    </GridForm>
  );
};

export default CreateGuildForm;
