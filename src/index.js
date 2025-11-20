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
  if (!text.endsWith("\n")) text += "\n";

  // process special syntax blocks
  if (text.match(/^\s*#/g)) return processHeading(text).trim();
  if (text.match(/```([\s\S]+?)```/g)) return processCodeBlock(text).trim();
  if (text.match(/^[ \t]*(?:[-+*]|\d+\.)[ \t]+/g))
    return processList(text).trim();
  if (text.match(/^\|/g)) return processTable(text).trim();

  // Remove newlines from continued text blocks (unless two or more space at the end of a line or the next line starts with special markdown characters)
  text = text.replace(
    /(?<=\S) ?$\n^[ \t]*(?!(?:(?:[-+*]|(?:\d+\.)) )|[\s#])/gm,
    " "
  );
  // Remove trailing whitespaces
  text = text.replace(/^(.*?)[^\S\n]*$/gm, "$1");

  // HORIZONTAL RULE
  text = text.replace(/^(\-{3,}|\*{3,})$/gm, "[hr][/hr]");

  // BOLD, ITALIC, STRIKETHROUGH
  text = text.replace(/\*\*(.+?)\*\*/g, "[b]$1[/b]");
  text = text.replace(/\*(.+?)\*/g, "[i]$1[/i]");
  text = text.replace(/_(.+?)_/g, "[i]$1[/i]");
  text = text.replace(/~~(.+?)~~/g, "[strike]$1[/strike]");

  // LINKS
  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    "[url=$2]$1[/url]"
  );

  // BLOCK QUOTES
  text = text.replace(/^> (.*)$/gm, "[quote]$1[/quote]");

  // INLINE CODE
  text = text.replace(/`([^`]+)`/g, "[code]$1[/code]");

  return text.trim();
}

function processHeading(text) {
  text = text.replace(/^### (.*)$/gm, "[h3]$1[/h3]");
  text = text.replace(/^## (.*)$/gm, "[h2]$1[/h2]");
  text = text.replace(/^# (.*)$/gm, "[h1]$1[/h1]");
  return text;
}

function processCodeBlock(text) {
  text = text.replace(/```([\s\S]*?)```/g, (m, code) => {
    return "[code]" + code.trim() + "[/code]";
  });
  return text;
}

function processList(text) {
  return convertList(text);
}

function processTable(text) {
  return convertTable(text);
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
