// // prettier-ignore
// type Options = {
//   pretty?: boolean;
//   metadata?: boolean;
// };

// // prettier-ignore
// type ResultMap = {
//   "pretty-meta" : { html: string; meta: object; formatted: true };
//   pretty        : { html: string; formatted: true };
//   meta          : { raw: string; meta: object; formatted: true };
//   default       : { raw: string; formatted: true };
// };

// // prettier-ignore
// type ToKey<O extends Options> =
//   O extends { pretty: true; metadata: true }    ? "pretty-meta" :
//   O extends { pretty: true }                    ? "pretty"      :
//   O extends { metadata: true }                  ? "meta"        :
//   "default";

// type Result<O extends Options> = ResultMap[ToKey<O>];

// // prettier-ignore
// const renderStrategies = {
//   "pretty-meta" : () => ({ html: "<p>hi</p>", meta: {}, formatted: true }),
//   pretty        : () => ({ html: "<p>hi</p>", formatted: true }),
//   meta          : () => ({ raw: "hi", meta: {}, formatted: true }),
//   default       : () => ({ raw: "hi", formatted: true }),
// } satisfies { [K in keyof ResultMap]: ()=> ResultMap[K] };

// const getStorageKey = (opts: Options) => {
//   if (opts.pretty && opts.metadata) return "pretty-meta";
//   if (opts.pretty) return "pretty";
//   if (opts.metadata) return "meta";
//   return "default";
// };

// function render<O extends Options>(opts: O): Result<O> {
//   const key = getStorageKey(opts);
//   const result = renderStrategies[key]();

//   return result as Result<O>;
// }

// const a = render({ pretty: true, metadata: true });
// console.log(a.formatted);
// console.log(a.html);
// console.log(a.meta);

// const d = render({});
// console.log(d.formatted);
// console.log(d.raw);

// -------------------------------

// // --- THE TAGGED UNION PATTERN (The Gold Standard) ---

// // 1. THE OPTIONS (Mutually Exclusive Modes)
// type FormatOptions =
//   | { mode: "string" }
//   | { mode: "binary" }
//   | { mode: "number" };

// // 2. THE RESULT MAP (The "Menu")
// type ResultMap = {
//   string: string;
//   binary: string;
//   number: number;
// };

// // 3. THE "GPS" TYPE (Indexed Access)
// // This automatically finds the correct type by looking up 'mode' in the map!
// type Result<O extends FormatOptions> = ResultMap[O["mode"]];

// type RenderArgs<O extends FormatOptions> = {
//   value: number;
//   options: O;
// };

// // 4. THE IMPLEMENTATION (Zero Logic)
// const render = <O extends FormatOptions>({
//   value,
//   options,
// }: RenderArgs<O>): Result<O> => {
//   const results = {
//     string: () => value.toString(),
//     binary: () => value.toString(2),
//     number: () => value,
//   } satisfies { [K in keyof ResultMap]: () => ResultMap[K] };

//   // The 'mode' is the key. No ternary needed!
//   const key = options.mode;

//   return results[key]() as Result<O>;
// };

// // 5. THE TESTS
// const a = render({ value: 1, options: { mode: "string" } });
// console.log(a, typeof a);

// const b = render({ value: 1, options: { mode: "binary" } });
// console.log(b, typeof b);

// const c = render({ value: 1, options: { mode: "number" } });
// console.log(c, typeof c);
