// Sample Markdown test cases
const testCases = [
  {
    name: "Headings",
    input: `# Heading 1
## Heading 2
### Heading 3
`,
    expected: `[h1]Heading 1[/h1]
[h2]Heading 2[/h2]
[h3]Heading 3[/h3]
`,
  },
  {
    name: "Bold and Italic",
    input: `**Bold**
*Italic*
_Italic_
~~Strike~~
`,
    expected: `[b]Bold[/b]
[i]Italic[/i]
[i]Italic[/i]
[strike]Strike[/strike]
`,
  },
  {
    name: "Links",
    input: `[Google](https://google.com)`,
    expected: `[url=https://google.com]Google[/url]
`,
  },
  {
    name: "Quotes",
    input: `> This is a quote`,
    expected: `[quote]This is a quote[/quote]
`,
  },
  {
    name: "Inline and Block Code",
    input: `\`inline code\`

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
    input: `* Item 1
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
[/list]
`,
  },
  {
    name: "Ordered List",
    input: `1. Step 1
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
[/olist]
`,
  },
  {
    name: "Table",
    input: `| Name | Age |
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
[/table]
`,
  },
];

function runTests() {
  const tbody = document.getElementById("testTableBody");

  testCases.forEach(({ name, input, expected }) => {
    const result = markdownToBBCode(input);
    const passed = result === expected;

    const row = document.createElement("tr");
    if (!passed) row.classList.add("table-danger");

    row.innerHTML = `
      <td class="fw-bold">${name}</td>
      <td><pre>${escapeHtml(input)}</pre></td>
      <td><pre>${escapeHtml(expected)}</pre></td>
      <td><pre>${escapeHtml(result)}</pre></td>
    `;

    tbody.appendChild(row);
  });
}

function escapeHtml(str) {
  return (
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // whitespace visualizers
      .replace(/ /g, "·")
      .replace(/\t/g, "⇥···")
      .replace(/\n/g, "⏎\n")
  );
}

function loadTestUI() {
  const mainUI = document.querySelector(".container-fluid");
  const testUI = document.getElementById("testContainer");

  document.body.classList.add("test-mode");

  mainUI.style.display = "none";
  testUI.style.display = "block";

  runTests();
}

loadTestUI();
