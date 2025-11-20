const input = document.getElementById("markdownInput");
const output = document.getElementById("bbcodeOutput");

// Detect /?test mode
const params = new URLSearchParams(window.location.search);
const isTestMode = params.has("test");

if (isTestMode) {
  // Load tests.js dynamically
  const script = document.createElement("script");
  script.src = "tests.js";
  document.body.appendChild(script);
} else {
  input.addEventListener("input", () => {
    const markdown = input.value;
    const bbcode = markdownToBBCode(markdown);
    output.value = bbcode;
  });
}

function markdownToBBCode(markdownText) {
  // add newlines in markdown to cleanly separate markdown blocks
  markdownText = markdownText.replace(/^(#.*)$/gm, "\n$1\n");
  markdownText = markdownText.replace(/^\-{3,}$/gm, "\n---\n");
  markdownText = markdownText.replace(/^\*{3,}$/gm, "\n***\n");
  markdownText = markdownText.replace(/^(```[\s\S]+?```)$/gm, "\n$1\n");
  markdownText = markdownText.replace(/^(\|[\s\S]+?\|)$/gm, "\n$1\n");

  // detect markdown blocks
  const matches = markdownText.match(/(?:[^\n]+(?:\n|$))+/gm);
  const output = matches.map(processMarkdownBlock).join("\n\n") + "\n";
  return output;
}

function processMarkdownBlock(text) {
  // Ensure a trailing newline in markdown
  text = text + "\n";

  // HEADINGS
  text = text.replace(/^### (.*)$/gm, "[h3]$1[/h3]");
  text = text.replace(/^## (.*)$/gm, "[h2]$1[/h2]");
  text = text.replace(/^# (.*)$/gm, "[h1]$1[/h1]");

  // BOLD, ITALIC, STRIKETHROUGH
  text = text.replace(/\*\*(.*?)\*\*/g, "[b]$1[/b]");
  text = text.replace(/\*(.*?)\*/g, "[i]$1[/i]");
  text = text.replace(/_(.*?)_/g, "[i]$1[/i]");
  text = text.replace(/~~(.*?)~~/g, "[strike]$1[/strike]");

  // HORIZONTAL RULE
    text = text.replace(/^(\-{3,}|\*{3,})$/gm, "[hr][/hr]");

  // LINKS
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    "[url=$2]$1[/url]"
  );

  // BLOCK QUOTES
  text = text.replace(/^> (.*)$/gm, "[quote]$1[/quote]");

  // MULTILINE CODE BLOCKS
  text = text.replace(/```([\s\S]*?)```/g, (m, code) => {
    return "[code]" + code.trim() + "[/code]";
  });

  // INLINE CODE
  text = text.replace(/`([^`]+)`/g, "[code]$1[/code]");

  // LISTS
  text = text.replace(
    /(?:^[\t ]*(?:(?:[-+*]|(?:\d+\.)|[\t ]+) )(?:[^\n]+)$\n)+/gm,
    (match) => convertList(match)
  );

  // TABLES
  if (/\|/.test(text)) {
    text = text.replace(/((?:\|.*\|\r?\n?)+)/g, (match) => convertTable(match));
  }

  return text.trim();
}

function convertList(listMarkdown) {
  const items = parseList(listMarkdown);
  const splitLists = splitByType(items);
  const bbcodeLists = splitLists.map(itemsToBBCode);
  return bbcodeLists.join("\n\n") + "\n";
}

function parseList(listText) {
  const lines = listText.split("\n");
  const items = [];

  for (let line of lines) {
    const match = line.match(/^([ \t]*)([-+*]|(?:\d+\.)|[\t ]+) (.+)$/);
    if (!match) continue;
    const indent = match[1].length;
    const type = /^\d+\./.test(match[2]) ? "ordered" : "unordered";
    const text = match[3] || "";

    if (match[2].trim() === "" && items.length > 0) {
      // continuation
      items[items.length - 1].text += " " + line.trim();
    } else {
      items.push({ indent, type, text });
    }
  }

  return items;
}

function splitByType(items) {
  const result = [];
  let current = [];

  for (let item of items) {
    if (current.length && item.type !== current[0].type) {
      result.push(current);
      current = [];
    }
    current.push(item);
  }

  if (current.length) result.push(current);
  return result;
}

function normalizeIndent(items) {
  let lastIndent = 0;
  let indentStep = 2;

  items.forEach((item) => {
    if (item.indent > lastIndent) item.indent = lastIndent + indentStep;
    lastIndent = item.indent;
  });

  return items;
}

function itemsToBBCode(items) {
  items = normalizeIndent(items);

  const bbcode = [];
  let stack = [];

  items.forEach((item) => {
    const indent = " ".repeat(item.indent);

    // Open a new list if needed
    if (!stack.length || stack[stack.length - 1].indent < item.indent) {
      const tag = item.type === "ordered" ? "olist" : "list";
      bbcode.push(`${indent}[${tag}]`);
      stack.push({ indent: item.indent, tag });
    } else {
      // Close lists if current indent is smaller
      while (stack.length && stack[stack.length - 1].indent > item.indent) {
        const { tag } = stack.pop();
        const closeIndent = " ".repeat(
          stack.length ? stack[stack.length - 1].indent : 0
        );
        bbcode.push(`  ${closeIndent}[/${tag}]`);
      }
    }

    bbcode.push(`  ${indent}[*] ${item.text}`);
  });

  // Close remaining lists
  while (stack.length) {
    const { tag } = stack.pop();
    const closeIndent = "  ".repeat(
      stack.length ? stack[stack.length - 1].indent / 2 : 0
    );
    bbcode.push(`${closeIndent}[/${tag}]`);
  }

  return bbcode.join("\n");
}

function convertTable(tableMarkdown) {
  const lines = tableMarkdown
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.includes("|") && !/^ *\| *-/.test(line)); // ignore separator line

  if (lines.length < 1) return tableMarkdown;

  const headerLine = lines[0];
  const headers = headerLine
    .split("|")
    .map((h) => h.trim())
    .filter((h) => h.length);

  const rows = lines.slice(1).map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter((cell) => cell.length)
  );

  let bbcode = "[table]\n  [tr]\n";
  headers.forEach((h) => (bbcode += `    [th]${h}[/th]\n`));
  bbcode += "  [/tr]\n";

  rows.forEach((row) => {
    bbcode += "  [tr]\n";
    row.forEach((c) => (bbcode += `    [td]${c}[/td]\n`));
    bbcode += "  [/tr]\n";
  });

  bbcode += "[/table]\n";
  return bbcode;
}
