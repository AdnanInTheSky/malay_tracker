const { readSectionFiles, writeJson } = require('./parser');

function buildTranslation() {
    const files = readSectionFiles('translation');
    const section = files.find(f => f.filename === 'section.md') || {};
    const nodes = files
        .filter(f => f.type === 'node' || f.filename.startsWith('node-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            description: f._body || f.description || ''
        }));

    const dropdowns = files
        .filter(f => f.type === 'dropdown' || f.filename.startsWith('dropdown-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => {
            const item = { question: f.question || '' };
            if (f.items && f.items.length) {
                item.items = f.items;
            }
            if (f._body || f.answer) {
                item.answer = f._body || f.answer || '';
            }
            return item;
        });

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        sub: section.sub || '',
        nodes: nodes,
        dropdowns: dropdowns
    };

    writeJson('translation.json', result);
}

if (require.main === module) {
    buildTranslation();
}

module.exports = buildTranslation;
