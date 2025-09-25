import { RemainingShipsProps } from "../../types/RemainingShips.types";

import styles from "./RemainingShips.module.css";

const RemainingShips = ({ remainingShips }: RemainingShipsProps) => {
  return Array.from({ length: remainingShips }).map((_, idx) => (
    <svg
      key={idx}
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 76.75 88.5"
    >
      <use href="/assets/ship_icon.svg" />
    </svg>
  ));
};

export default RemainingShips;
