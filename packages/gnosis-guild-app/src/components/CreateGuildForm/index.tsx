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

type ErrorThemeProps = {
  visible: boolean;
};

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
  justify-content: center;
  align-items: flex-start;
  margin-top: 1rem;
  margin-bottom: 1rem;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
  flex-direction: column;
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

const ErrorText = styled(Text)<ErrorThemeProps>`
  margin-top: 0.4rem;
  visibility: ${(props) => (props.visible ? "visible" : "hidden	")};
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

  const [guildImageError, setGuildImageError] = useState(false);

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
    // Check base cases here
    let hasImage = false;
    if (guildImage) {
      hasImage = guildImage.name ? true : false;
    }
    const valid =
      !guildName ||
      !guildDescription ||
      !guildExternalLink ||
      !contentFormat ||
      !hasImage ||
      guildMinimumAmount === "0" ||
      guildImageError;
    if (valid) {
      setInvalidForm(true);
    }
  }, [
    guildName,
    guildDescription,
    guildExternalLink,
    contentFormat,
    guildImage,
    guildMinimumAmount,
    guildImageError,
  ]);

  const uploadImage = (
    e: MouseEvent<HTMLInputElement> | ChangeEvent<HTMLInputElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const input = hiddenImageInput.current as HTMLInputElement;
    let validImage = false;
    if (input.files) {
      const file = input.files[0];
      if (!file) {
        return;
      }
      validImage =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/svg+xml";
      setGuildImageError(!validImage);
      setInvalidForm(!validImage);
    }
    if (target.files && input.files && validImage) {
      setGuildImage(input.files[0]);
      setGuildImageError(false);
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
        active: guildMetadata.active,
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
        active: false,
      };
      const tx = (await createGuild(
        providerChainId,
        ethersProvider,
        guildInfo,
        account,
        sdk,
        setModal
      )) as any;

      if (tx) {
        if (tx.detailedExecutionInfo?.confirmationsRequired === 1) {
          await refreshGuild();
        }
      }

      setLoadingTitle("");
      setLoadingFooter("");
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const setModal = (isOpen: boolean, title?: string, footer?: string) => {
    if (isOpen) {
      setSubmitting(isOpen);
    }
    if (title) {
      setLoadingTitle(title);
    }
    if (footer) {
      setLoadingFooter(footer);
    }
  };

  const updateTx = async (): Promise<void> => {
    if (!ethersProvider) {
      console.error("EthersProvider has not been set yet");
      return;
    }

    setSubmitting(true);
    setLoadingTitle("Setting up transaction to be sent");
    const tx = (await updateMetadataCid(
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
        active: true,
      },
      ethersProvider,
      sdk,
      setModal
    )) as any;
    if (tx) {
      if (tx.detailedExecutionInfo?.confirmationsRequired === 1) {
        await refreshGuild();
      }
    }
    setLoadingTitle("");
    setLoadingFooter("");
    setSubmitting(false);
  };

  // Upload text
  const imageUploadText =
    guildImage && guildImage.name ? "Replace Image" : "Upload Image";
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
      setInvalidForm(true);
    } else {
      setInvalidForm(false);
    }

    if (!val) {
      setInvalidForm(true);
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
      setInvalidForm(true);
    } else {
      setInvalidForm(false);
    }
    if (!val) {
      setInvalidForm(true);
    }
  };

  const updateGuildExternalLink = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setGuildExternalLinkMeta({ error: "" });
    setGuildExternalLink(val);
    if (val && !isURL(val)) {
      setInvalidForm(true);
      setGuildExternalLinkMeta({
        error: "Guild external link must be a valid Url",
      });
    } else {
      setInvalidForm(false);
    }
    if (!val) {
      setInvalidForm(true);
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
      setInvalidForm(true);
    } else {
      setInvalidForm(false);
    }
    if (!val) {
      setInvalidForm(true);
    }
  };

  const pauseGuild = async (e: MouseEvent<HTMLButtonElement>) => {
    if (!ethersProvider) {
      console.error("EthersProvider has not been set yet");
      return;
    }

    const tx = (await deactivateGuild(
      ethersProvider,
      account,
      guildAddress,
      sdk,
      setModal
    )) as any;
    if (tx) {
      if (tx.detailedExecutionInfo?.confirmationsRequired === 1) {
        setGuildMetadata({
          name: "",
          description: "",
          contentFormat: "",
          externalLink: "",
          image: new File([], ""),
          currency: "ETH",
          amount: "0",
          guildAddress: "",
          imageCid: "",
          active: false,
        });
      }
    }
    setLoadingTitle("");
    setLoadingFooter("");
    setSubmitting(false);
  };

  const deleteButton = guildMetadata.active && (
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
        <ErrorText size="md" color="error" visible={guildImageError}>
          The uploaded image must be a .png, .svg or .jpeg
        </ErrorText>
      </ButtonContainer>
      <FormItem>
        <AmountInput
          title="Monthly Contributors"
          currency={activeCurrency}
          setCurrency={setActiveCurrency}
          amount={guildMinimumAmount}
          setInvalidForm={setInvalidForm}
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
