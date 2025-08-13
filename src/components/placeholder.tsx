import { LucideMessageSquareWarning } from "lucide-react";

interface PlaceHolderProps {
  label: string;
  icon?: React.ReactElement;
  button?: React.ReactElement;
}

function Placeholder({
  label,
  icon = <LucideMessageSquareWarning className="size-12" />,
  button = <div className="h-9" />,
}: PlaceHolderProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 self-center">
      {icon}
      <h2 className="text-center text-lg">{label}</h2>
      {button}
    </div>
  );
}

export default Placeholder;
