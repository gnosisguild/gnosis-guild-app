import { Select } from "@gnosis.pm/safe-react-components";

type Props = {
  activeId: string;
  setActiveCurrency: (id: string) => void;
};

const CurrencySelect: React.FC<Props> = ({ activeId, setActiveCurrency }) => {
  const selectItems = [
    { id: "ETH", label: "ETH" },
    { id: "DAI", label: "Dai" }
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
