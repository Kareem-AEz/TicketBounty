"use client";

import { format } from "date-fns";
import { LucideCalendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DatePickerProps = {
  id: string;
  name: string;
  defaultValue?: string;
};

export function DatePicker({ id, name, defaultValue }: DatePickerProps) {
  const [date, setDate] = useState<Date | undefined>(
    defaultValue ? new Date(defaultValue) : undefined,
  );

  const formattedDate = date ? (
    format(date, "yyyy-MM-dd")
  ) : (
    <span>Pick a deadline</span>
  );

  return (
    <Popover>
      <PopoverTrigger id={id} asChild>
        <Button
          variant="outline"
          data-empty={!date}
          className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
        >
          <LucideCalendar />
          {formattedDate}
          <input
            type="hidden"
            name={name}
            value={date ? format(date, "yyyy-MM-dd") : ""}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          disabled={{ before: new Date() }}
          onSelect={setDate}
          showOutsideDays
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}
