// Sample Markdown test cases
const testCases = [
  {
    name: "Headings",
    input: `
# Heading 1
## Heading 2
### Heading 3
`,
    expected: `[h1]Heading 1[/h1]
[h2]Heading 2[/h2]
[h3]Heading 3[/h3]`,
  },
  {
    name: "Bold and Italic",
    input: `
**Bold**
*Italic*
_Italic_
~~Strike~~
`,
    expected: `[b]Bold[/b]
[i]Italic[/i]
[i]Italic[/i]
[strike]Strike[/strike]`,
  },
  {
    name: "Links",
    input: `[Google](https://google.com)`,
    expected: `[url=https://google.com]Google[/url]`,
  },
  {
    name: "Quotes",
    input: `> This is a quote`,
    expected: `[quote]This is a quote[/quote]`,
  },
  {
    name: "Inline and Block Code",
    input: `
\`inline code\`

\`\`\`
multiline
code block
\`\`\`
`,
    expected: `[code]inline code[/code]

[code]multiline
code block[/code]`,
  },
  {
    name: "Unordered List",
    input: `
* Item 1
  * Item 1.1
    * Item 1.1.1
* Item 2
- Dash item
+ Plus item
`,
    expected: `[list]
  [*] Item 1
  [list]
    [*] Item 1.1
    [list]
      [*] Item 1.1.1
    [/list]
  [/list]
  [*] Item 2
  [*] Dash item
  [*] Plus item
[/list]`,
  },
  {
    name: "Ordered List",
    input: `
1. Step 1
   1. Step 1.1
      1. Step 1.1.1
2. Step 2
`,
    expected: `[olist]
  [*] Step 1
  [olist]
    [*] Step 1.1
    [olist]
      [*] Step 1.1.1
    [/olist]
  [/olist]
  [*] Step 2
[/olist]`,
  },
  {
    name: "Table",
    input: `
| Name | Age |
|------|-----|
| John | 65  |
| Gitte| 40  |
| Sussie | 19 |
`,
    expected: `[table]
  [tr]
    [th]Name[/th]
    [th]Age[/th]
  [/tr]
  [tr]
    [td]John[/td]
    [td]65[/td]
  [/tr]
  [tr]
    [td]Gitte[/td]
    [td]40[/td]
  [/tr]
  [tr]
    [td]Sussie[/td]
    [td]19[/td]
  [/tr]
[/table]`,
  },
];

// Run test cases
function runTests(transpilerFunc) {
  testCases.forEach(({ name, input, expected }, index) => {
    const output = transpilerFunc(input);
    const passed = output === expected;
    console.log(`${index + 1}. ${name}: ${passed ? "✅ Passed" : "❌ Failed"}`);
    if (!passed) {
      console.log("Input:\n", input);
      console.log("Expected:\n", expected);
      console.log("Got:\n", output);
      console.log("---------------------------------------------------");
    }
  });
}

runTests(markdownToBBCode);
