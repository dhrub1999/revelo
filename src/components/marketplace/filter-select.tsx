import { clsx } from "clsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Base UI's Select rejects an empty-string item value, but our filter API
// uses "" to mean "no filter" — map it to a sentinel at this boundary only.
const EMPTY_VALUE = "__all__";

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select
      value={value === "" ? EMPTY_VALUE : value}
      onValueChange={(next) => onChange(!next || next === EMPTY_VALUE ? "" : next)}
    >
      <SelectTrigger aria-label={label} className={clsx("bg-surface", className)}>
        <SelectValue>
          {(current: string) =>
            options.find(
              (option) => (option.value === "" ? EMPTY_VALUE : option.value) === current,
            )?.label ?? current
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value === "" ? EMPTY_VALUE : option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
