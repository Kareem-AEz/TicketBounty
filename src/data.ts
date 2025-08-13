export const initialTickets = [
  {
    id: "1",
    title:
      "This is a very long ticket title that should definitely be truncated when the screen gets narrow",
    content:
      "This is the first ticket with a much longer description that should demonstrate the line clamping behavior when the content gets too long to fit in the available space.",
    status: "DONE" as const,
  },
  {
    id: "2",
    title:
      "Another extremely long ticket title that will test our truncation implementation",
    content:
      "This is the second ticket with an even longer description to test how well our line clamping works in various scenarios and screen sizes.",
    status: "OPEN" as const,
  },
];
