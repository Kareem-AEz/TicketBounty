// --- THE MASTER'S CHALLENGE: NOTIFICATION FACTORY (Iron-Clad Version) ---

type Priority = "low" | "high";

type NotificationInput =
  | {
      type: "success";
      message: string;
    }
  | {
      type: "error";
      message: string;
      code: number;
    }
  | {
      type: "info";
      message: string;
      priority: Priority;
    };

type NotificationMap = {
  success: {
    status: "done";
    message: string;
  };
  error: {
    status: "failed";
    message: string;
    code: number;
  };
  info: {
    status: "waiting";
    message: string;
    priority: Priority;
  };
};

type NotificationResult<I extends NotificationInput> =
  NotificationMap[I["type"]];

const createNotification = <I extends NotificationInput>(
  input: I,
): NotificationResult<I> => {
  // 1. The "Bridge": Cast input to the union to help the switch
  const inputAsUnion = input as NotificationInput;

  // 2. The "Logic": Switch narrows the union safely
  switch (inputAsUnion.type) {
    case "success":
      return {
        status: "done",
        message: inputAsUnion.message,
      } as NotificationResult<I>;

    case "error":
      // TS sees .code because of the 'inputAsUnion' narrowing
      return {
        status: "failed",
        message: inputAsUnion.message,
        code: inputAsUnion.code,
      } as NotificationResult<I>;

    case "info":
      // TS sees .priority because of the 'inputAsUnion' narrowing
      return {
        status: "waiting",
        message: inputAsUnion.message,
        priority: inputAsUnion.priority,
      } as NotificationResult<I>;

    default:
      throw new Error("Invalid input");
  }
};

// 3. THE TESTS (Hover over these to see the magic!)
const a = createNotification({
  type: "error",
  message: "Not found",
  code: 404,
});

const b = createNotification({
  type: "success",
  message: "Success!",
});

console.log(a.status, a.code); // Prints: failed 404
console.log(b.status, b.message); // Prints: done Success!
