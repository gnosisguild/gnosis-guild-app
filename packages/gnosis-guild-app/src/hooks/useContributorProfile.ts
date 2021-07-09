import { useCallback, useEffect, useState } from "react";

import { useWeb3Context } from "../context/Web3Context";
import { ContributorProfile } from "../types";

type ContributorProfileMeta = {
  profileName: string;
  profileEmail: string;
  saveContributorProfile: (arg0: string, arg1: string) => void;
};

export const useContributorProfile = (): ContributorProfileMeta => {
  const { idx, did, account } = useWeb3Context();
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  const saveContributorProfile = async (name: string, email: string) => {
    const recipients = [
      did?.id as string,
      "did:key:z6MkuCGtjBKamt3RaLSjGYcViKYRrmaH7BAavD6o6CESoQBo", // Server DID
    ];
    const record = await did?.createDagJWE(
      {
        name,
        email,
        address: account,
      },
      recipients
    );

    if (record) {
      await idx
        ?.set("contributorProfile", { profile: record })
        .catch((err) =>
          console.error(`Failed to save contributorProfile: ${err}`)
        );
      setProfileName(name);
      setProfileEmail(email);
    }
  };

  const setContributorProfile = useCallback(async () => {
    if (!did) {
      return;
    }
    const encryptedProfile = (await idx?.get("contributorProfile")) as any;
    if (!encryptedProfile) {
      return;
    }
    const profile = (await did?.decryptDagJWE(
      encryptedProfile.profile
    )) as ContributorProfile;

    if (profile) {
      if (!profileName) {
        setProfileName(profile.name);
      }
      if (!profileEmail) {
        setProfileEmail(profile.email);
      }
    }
  }, [did, idx, profileEmail, profileName]);

  // Set Idx ContributorProfile
  useEffect(() => {
    const setProfile = async () => {
      await setContributorProfile();
    };
    if (idx) {
      setProfile();
    }
  }, [idx, setContributorProfile]);

  return {
    profileName,
    profileEmail,
    saveContributorProfile,
  };
};
