// Sample Markdown test cases
const testCases = [
  {
    name: "Textblock",
    input: [
      "This is a textblock of multiple lines.",
      "All lines should be concatenated.",
    ].join("\n"),
    expected: [
      "This is a textblock of multiple lines. All lines should be concatenated.",
      "",
    ].join("\n"),
  },
  {
    name: "Textblock + Newline",
    input: [
      "This is a textblock of multiple lines.",
      "All lines should be concatenated.",
      "",
    ].join("\n"),
    expected: [
      "This is a textblock of multiple lines. All lines should be concatenated.",
      "",
    ].join("\n"),
  },
  {
    name: "Textblock + Forced Newline",
    input: [
      "This is a textblock of multiple lines.  ",
      "This line should not be concatenated.",
    ].join("\n"),
    expected: [
      "This is a textblock of multiple lines.",
      "This line should not be concatenated.",
      "",
    ].join("\n"),
  },
  {
    name: "Multiple Newlines",
    input: ["This is a textblock", "", "", "Another textblock"].join("\n"),
    expected: ["This is a textblock", "", "Another textblock", ""].join("\n"),
  },
  {
    name: "Trim trailing whitespaces",
    input: [
      "This is text with one space. ",
      "",
      "This is text with two spaces  ",
      "",
      "This is text with three spaces   ",
      "",
      "This is text with four spaces    ",
      " ",
      "that was an emtpy line with one space",
    ].join("\n"),
    expected: [
      "This is text with one space.",
      "",
      "This is text with two spaces",
      "",
      "This is text with three spaces",
      "",
      "This is text with four spaces",
      "",
      "that was an emtpy line with one space",
      "",
    ].join("\n"),
  },
  {
    name: "Formatted text with concatenation",
    input: ["**Bold**  ", "*Italic*  ", "_Italic_  ", "~~Strike~~"].join("\n"),
    expected: [
      "[b]Bold[/b]",
      "[i]Italic[/i]",
      "[i]Italic[/i]",
      "[strike]Strike[/strike]",
      "",
    ].join("\n"),
  },
  {
    name: "Headings",
    input: ["# Heading 1", "## Heading 2", "### Heading 3", ""].join("\n"),
    expected: [
      "[h1]Heading 1[/h1]",
      "",
      "[h2]Heading 2[/h2]",
      "",
      "[h3]Heading 3[/h3]",
      "",
    ].join("\n"),
  },
  {
    name: "Bold",
    input: ["**Bold**"].join("\n"),
    expected: ["[b]Bold[/b]", ""].join("\n"),
  },
  {
    name: "Italic (*)",
    input: ["*Italic*"].join("\n"),
    expected: ["[i]Italic[/i]", ""].join("\n"),
  },
  {
    name: "Italic (_)",
    input: ["_Italic_"].join("\n"),
    expected: ["[i]Italic[/i]", ""].join("\n"),
  },
  {
    name: "Strikethrough",
    input: ["~~Strikethrough~~"].join("\n"),
    expected: ["[strike]Strikethrough[/strike]", ""].join("\n"),
  },
  {
    name: "Horizontal Rule (---)",
    input: ["---"].join("\n"),
    expected: ["[hr][/hr]", ""].join("\n"),
  },
  {
    name: "Horizontal Rule (***)",
    input: ["***"].join("\n"),
    expected: ["[hr][/hr]", ""].join("\n"),
  },
  {
    name: "Horizontal Rule more than three",
    input: ["-----"].join("\n"),
    expected: ["[hr][/hr]", ""].join("\n"),
  },
  {
    name: "Horizontal Rule Multiline",
    input: ["Text", "---", "***", "More Text", "---"].join("\n"),
    expected: [
      "Text",
      "",
      "[hr][/hr]",
      "",
      "[hr][/hr]",
      "",
      "More Text",
      "",
      "[hr][/hr]",
      "",
    ].join("\n"),
  },
  {
    name: "Links",
    input: "[Google](https://google.com)",
    expected: ["[url=https://google.com]Google[/url]", ""].join("\n"),
  },
  {
    name: "Quotes",
    input: "> This is a quote",
    expected: ["[quote]This is a quote[/quote]", ""].join("\n"),
  },
  {
    name: "Inline Code",
    input: ["Text with `inline code` and text"].join("\n"),
    expected: ["Text with [code]inline code[/code] and text", ""].join("\n"),
  },
  {
    name: "Multiline Code Block",
    input: ["```", "multiline", "code block", "```"].join("\n"),
    expected: ["[code]multiline", "code block[/code]", ""].join("\n"),
  },
  {
    name: "Multiline Code Block with Text",
    input: ["Text", "```", "multiline", "code block", "```", "Text"].join("\n"),
    expected: [
      "Text",
      "",
      "[code]multiline",
      "code block[/code]",
      "",
      "Text",
      "",
    ].join("\n"),
  },
  {
    name: "Inline and Block Code",
    input: ["`inline code`", "", "```", "multiline", "code block", "```"].join(
      "\n"
    ),
    expected: [
      "[code]inline code[/code]",
      "",
      "[code]multiline",
      "code block[/code]",
    ].join("\n"),
  },
  {
    name: "Unordered List",
    input: [
      "* Item 1",
      "  * Item 1.1",
      "    * Item 1.1.1",
      "* Item 2",
      "- Dash item",
      "+ Plus item",
    ].join("\n"),
    expected: [
      "[list]",
      "  [*] Item 1",
      "  [list]",
      "    [*] Item 1.1",
      "    [list]",
      "      [*] Item 1.1.1",
      "    [/list]",
      "  [/list]",
      "  [*] Item 2",
      "  [*] Dash item",
      "  [*] Plus item",
      "[/list]",
      "",
    ].join("\n"),
  },
  {
    name: "Ordered List",
    input: [
      "1. Step 1",
      "   1. Step 1.1",
      "      1. Step 1.1.1",
      "2. Step 2",
    ].join("\n"),
    expected: [
      "[olist]",
      "  [*] Step 1",
      "  [olist]",
      "    [*] Step 1.1",
      "    [olist]",
      "      [*] Step 1.1.1",
      "    [/olist]",
      "  [/olist]",
      "  [*] Step 2",
      "[/olist]",
      "",
    ].join("\n"),
  },
  {
    name: "Table",
    input: [
      "| Name   | Age |",
      "| ------ | --- |",
      "| John   | 65  |",
      "| Gitte  | 40  |",
      "| Sussie | 19  |",
    ].join("\n"),
    expected: [
      "[table]",
      "  [tr]",
      "    [th]Name[/th]",
      "    [th]Age[/th]",
      "  [/tr]",
      "  [tr]",
      "    [td]John[/td]",
      "    [td]65[/td]",
      "  [/tr]",
      "  [tr]",
      "    [td]Gitte[/td]",
      "    [td]40[/td]",
      "  [/tr]",
      "  [tr]",
      "    [td]Sussie[/td]",
      "    [td]19[/td]",
      "  [/tr]",
      "[/table]",
      "",
    ].join("\n"),
  },
  {
    name: "Table with Text",
    input: [
      "Text",
      "| A   | B   |",
      "| --- | --- |",
      "| 0   | 1   |",
      "Text",
    ].join("\n"),
    expected: [
      "Text",
      "",
      "[table]",
      "  [tr]",
      "    [th]A[/th]",
      "    [th]B[/th]",
      "  [/tr]",
      "  [tr]",
      "    [td]0[/td]",
      "    [td]1[/td]",
      "  [/tr]",
      "[/table]",
      "",
      "Text",
      "",
    ].join("\n"),
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
