"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type SelectInputProps<T extends { sortKey: string; sortOrder: string }> = {
  options: {
    sortKey: string;
    sortOrder: string;
    label: string;
  }[];
  value: T;
  setValue: (value: T) => void;
};

export default function SelectInput<
  T extends { sortKey: string; sortOrder: string },
>({ options, value, setValue }: SelectInputProps<T>) {
  const handleSort = (compositeSortKey: string) => {
    const [sortKey, sortOrder] = compositeSortKey.split("_");

    setValue({ sortKey, sortOrder } as T);
  };

  return (
    <Select
      onValueChange={handleSort}
      defaultValue={`${value.sortKey}_${value.sortOrder}`}
    >
      <SelectTrigger
        className="user-select-none w-[180px]"
        aria-label="Select input"
      >
        <SelectValue className="user-select-none" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={`${option.sortKey}_${option.sortOrder}`}
            value={`${option.sortKey}_${option.sortOrder}`}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
