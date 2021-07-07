import { useEffect, useState } from "react";

import { RISK_AGREEMENT_KEY } from "../constants";

export const useRiskAgreement = () => {
  const [riskAgreement, setRiskAgreement] = useState(true);
  useEffect(() => {
    const val = sessionStorage.getItem(RISK_AGREEMENT_KEY);
    if (val) {
      setRiskAgreement(val === "true");
    } else {
      setRiskAgreement(false);
    }
  }, []);

  const storeRiskAgreement = () => {
    const val = !riskAgreement;
    console.log("RiskAgreement");
    console.log(val);
    setRiskAgreement(val);
    sessionStorage.setItem(RISK_AGREEMENT_KEY, val.toString());
  };

  return {
    riskAgreement,
    setRiskAgreement: storeRiskAgreement,
  };
};
