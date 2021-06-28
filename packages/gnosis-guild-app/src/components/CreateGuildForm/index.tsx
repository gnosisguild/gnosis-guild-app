import React, {
  useState,
  useRef,
  MouseEvent,
  ChangeEvent,
  useEffect,
} from "react";
import styled from "styled-components";
import isURL from "validator/lib/isURL";
import {
  Button,
  GenericModal,
  Loader,
  Text,
  TextField,
} from "@gnosis.pm/safe-react-components";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";

import AmountInput from "../AmountInput";
import { useGuildContext } from "../../context/GuildContext";
import { useWeb3Context } from "../../context/Web3Context";
import { useGuild } from "../../hooks/useGuild";

const GridForm = styled.form`
  grid-area: form;
  margin: 0.4rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
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

const GuildLoaderContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const CreateGuildForm: React.FC = () => {
  const { refreshGuild, guildMetadata, setGuildMetadata } = useGuildContext();
  const { sdk } = useSafeAppsSDK();
  const { ethersProvider, account, providerChainId } = useWeb3Context();
  const { createGuild, deactivateGuild, updateMetadataCid } = useGuild();
  const [invalidForm, setInvalidForm] = useState(false);

  // Transaction Processing variables
  const [loadingTitle, setLoadingTitle] = useState("");
  const [loadingFooter, setLoadingFooter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Input values
  const [guildAddress, setGuildAddress] = useState(guildMetadata.guildAddress);
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
  const [guildNameMeta, setGuildNameMeta] = useState({ error: "" });
  const [guildDescriptionMeta, setGuildDescriptionMeta] = useState({
    error: "",
  });
  const [guildExternalLinkMeta, setGuildExternalLinkMeta] = useState({
    error: "",
  });
  const [guildContentFormatMeta, setGuildContentFormatMeta] = useState({
    error: "",
  });

  const [guildImage, setGuildImage] = useState(guildMetadata.image);
  const hiddenImageInput = useRef<HTMLInputElement>(null);

  const [activeCurrency, setActiveCurrency] = useState(guildMetadata.currency);

  useEffect(() => {
    setGuildAddress(guildMetadata.guildAddress);
    setGuildName(guildMetadata.name);
    setGuildDescription(guildMetadata.description);
    setContentFormat(guildMetadata.contentFormat);
    setGuildExternalLink(guildMetadata.externalLink);
    setGuildImage(guildMetadata.image);
    setActiveCurrency(guildMetadata.currency);
    setGuildMinimumAmount(guildMetadata.amount);
  }, [guildMetadata]);

  useEffect(() => {
    // Check all fields are valid
    const valid =
      !guildNameMeta.error &&
      !guildDescriptionMeta.error &&
      !guildExternalLinkMeta.error &&
      !guildContentFormatMeta.error;
    setInvalidForm(!valid);
  }, [
    guildNameMeta,
    guildDescriptionMeta,
    guildContentFormatMeta,
    guildExternalLinkMeta,
  ]);

  const uploadImage = (
    e: MouseEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const input = hiddenImageInput.current as HTMLInputElement;
    if (target.files && input.files) {
      setGuildImage(input.files[0]);
      setGuildMetadata({
        name: guildName,
        description: guildDescription,
        contentFormat: contentFormat,
        externalLink: guildExternalLink,
        currency: activeCurrency,
        amount: guildMinimumAmount,
        guildAddress: guildAddress,
        imageCid: guildMetadata.imageCid,
        image: input.files[0],
      });
    }
  };

  const clickImageInput = (e: MouseEvent<HTMLButtonElement>) => {
    hiddenImageInput?.current?.click();
  };

  const submitTx = async (): Promise<void> => {
    if (!ethersProvider) {
      console.error("EthersProvider has not been set yet");
      return;
    }
    setSubmitting(true);
    try {
      // Create guild

      setLoadingTitle("Setting up transaction to be sent");
      const guildInfo = {
        name: guildName,
        description: guildDescription,
        contentFormat: contentFormat,
        externalLink: guildExternalLink,
        image: guildImage,
        currency: activeCurrency,
        amount: guildMinimumAmount,
        guildAddress: guildAddress,
        imageCid: "",
      };
      const tx = await createGuild(
        providerChainId,
        ethersProvider,
        guildInfo,
        account,
        sdk,
        setSubmitting
      );
      setSubmitting(true);
      setLoadingTitle("Transaction is processing");
      setLoadingFooter("Processing should be finished in a few minutes!");

      // TODO: do we need to refresh
      /* await refreshGuild(); */

      setLoadingTitle("");
      setLoadingFooter("");
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const updateTx = async (): Promise<void> => {
    if (!ethersProvider) {
      console.error("EthersProvider has not been set yet");
      return;
    }

    setSubmitting(true);
    setLoadingTitle("Setting up transaction to be sent");
    const tx = await updateMetadataCid(
      {
        name: guildName,
        description: guildDescription,
        contentFormat: contentFormat,
        externalLink: guildExternalLink,
        image: guildImage,
        currency: activeCurrency,
        amount: guildMinimumAmount,
        guildAddress: guildAddress,
        imageCid: "",
      },
      ethersProvider,
      sdk,
      setSubmitting
    );
    setSubmitting(true);

    setLoadingTitle("Transaction is processing");
    setLoadingFooter("Processing should be finished in a few minutes!");
    // TODO: do we need to wait
    setLoadingTitle("");
    setLoadingFooter("");
    setSubmitting(false);
  };

  // Upload text
  const imageUploadText = guildMetadata.description
    ? "Replace Image"
    : "Upload Image";
  const guildButtonText = guildMetadata.imageCid
    ? "Update Guild"
    : "Create Guild";
  const submitGuildButtonText = `${
    guildMetadata.imageCid ? "Updating" : "Creating"
  } Guild...`;
  const guildTx = guildMetadata.imageCid ? updateTx : submitTx;

  const updateGuildName = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildNameMeta({ error: "" });
    setGuildName(val);
    if (val && val.length > 50) {
      setGuildNameMeta({ error: "Name must be less than 50 characters" });
    }
  };

  const updateGuildDescription = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildDescriptionMeta({ error: "" });
    setGuildDescription(val);
    if (val && val.length > 200) {
      setGuildDescriptionMeta({
        error: "Description must be less than 200 characters",
      });
    }
  };

  const updateGuildExternalLink = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildExternalLinkMeta({ error: "" });
    setGuildExternalLink(val);
    if (val && !isURL(val)) {
      setGuildExternalLinkMeta({
        error: "Guild external link must be a valid Url",
      });
    }
  };

  const updateGuildContentFormat = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildContentFormatMeta({ error: "" });
    setContentFormat(val);
    if (val && val.length > 200) {
      setGuildContentFormatMeta({
        error: "Must be less than 200 characters",
      });
    }
  };

  const pauseGuild = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ethersProvider) {
      console.error("EthersProvider has not been set yet");
      return;
    }

    deactivateGuild(providerChainId, ethersProvider, account, guildAddress);
  };

  const deleteButton = guildMetadata.name && (
    <DeleteButton
      size="lg"
      color="error"
      variant="contained"
      onClick={pauseGuild}
    >
      Delete Guild
    </DeleteButton>
  );

  const TransactionLoader = (
    <GuildLoaderContainer>
      <Loader size="lg" />
    </GuildLoaderContainer>
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
          onChange={uploadImage}
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

      <ButtonContainer>
        <Button
          size="lg"
          color="primary"
          variant="contained"
          onClick={guildTx}
          disabled={submitting || invalidForm}
        >
          {submitting ? submitGuildButtonText : guildButtonText}
        </Button>
        {deleteButton}
      </ButtonContainer>
      {submitting && (
        <GenericModal
          onClose={() => setSubmitting(false)}
          title={loadingTitle}
          body={TransactionLoader}
          footer={loadingFooter}
        />
      )}
    </GridForm>
  );
};

export default CreateGuildForm;
