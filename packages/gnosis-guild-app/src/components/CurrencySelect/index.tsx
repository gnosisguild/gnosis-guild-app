import { Select } from "@gnosis.pm/safe-react-components";

type Props = {
  activeId: string;
  setActiveCurrency: (id: string) => void;
};

const CurrencySelect: React.FC<Props> = ({ activeId, setActiveCurrency }) => {
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
  return (
    <Select
      activeItemId={activeId}
      items={selectItems}
      onItemClick={changeCurrency}
    />
  );
};

export default CurrencySelect;
