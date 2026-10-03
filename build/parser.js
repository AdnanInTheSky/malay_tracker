const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const contentDir = path.join(rootDir, 'content');
const dataDir = path.join(rootDir, 'data');

function parseYamlValue(str) {
    str = str.trim();
    if (!str) return '';
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return str.slice(1, -1);
        }
    }
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'null') return null;
    if (!isNaN(str) && str !== '') return Number(str);
    return str;
}

function parseYaml(yamlText) {
    const lines = yamlText.replace(/\r\n/g, '\n').split('\n');
    const root = {};
    let stack = [{ obj: root, indent: -1 }];

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim() || line.trim().startsWith('#')) {
            i++;
            continue;
        }

        const indent = line.search(/\S/);
        const trimmed = line.trim();

        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }
        const current = stack[stack.length - 1].obj;

        if (trimmed.startsWith('- ')) {
            // List item
            const itemContent = trimmed.substring(2).trim();
            if (itemContent.includes(':')) {
                // Object inside list
                const colonIdx = itemContent.indexOf(':');
                const key = itemContent.substring(0, colonIdx).trim();
                const valStr = itemContent.substring(colonIdx + 1).trim();
                const itemObj = {};
                if (valStr) {
                    itemObj[key] = parseYamlValue(valStr);
                } else {
                    itemObj[key] = [];
                }
                if (Array.isArray(current)) {
                    current.push(itemObj);
                    stack.push({ obj: itemObj, indent: indent });
                }
            } else {
                if (Array.isArray(current)) {
                    current.push(parseYamlValue(itemContent));
                }
            }
            i++;
            continue;
        }

        if (trimmed.includes(':')) {
            const colonIdx = trimmed.indexOf(':');
            const key = trimmed.substring(0, colonIdx).trim();
            const valStr = trimmed.substring(colonIdx + 1).trim();

            if (!valStr) {
                // Peek next line to see if it's a list or object
                let nextIndent = -1;
                let isList = false;
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].trim() && !lines[j].trim().startsWith('#')) {
                        nextIndent = lines[j].search(/\S/);
                        isList = lines[j].trim().startsWith('- ');
                        break;
                    }
                }

                if (isList) {
                    current[key] = [];
                    stack.push({ obj: current[key], indent: indent });
                } else if (nextIndent > indent) {
                    current[key] = {};
                    stack.push({ obj: current[key], indent: indent });
                } else {
                    current[key] = '';
                }
            } else {
                current[key] = parseYamlValue(valStr);
            }
            i++;
            continue;
        }

        i++;
    }

    return root;
}

function parseMarkdownFile(filePath) {
    const raw = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
    if (!raw.startsWith('---')) {
        return { frontmatter: {}, body: raw.trim() };
    }
    const endMatch = raw.indexOf('\n---', 3);
    if (endMatch === -1) {
        return { frontmatter: {}, body: raw.trim() };
    }
    const yamlPart = raw.substring(3, endMatch).trim();
    const bodyPart = raw.substring(endMatch + 4).trim();
    const frontmatter = parseYaml(yamlPart);
    return { frontmatter, body: bodyPart };
}

function readSectionFiles(sectionName) {
    const dir = path.join(contentDir, sectionName);
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
    return files.map(file => {
        const fullPath = path.join(dir, file);
        const parsed = parseMarkdownFile(fullPath);
        return {
            filename: file,
            ...parsed.frontmatter,
            _body: parsed.body
        };
    });
}

function writeJson(filename, data) {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    const target = path.join(dataDir, filename);
    fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[build] Created ${filename}`);
}

module.exports = {
    contentDir,
    dataDir,
    parseYaml,
    parseMarkdownFile,
    readSectionFiles,
    writeJson
};
