const { readSectionFiles, writeJson } = require('./parser');

function buildCapabilities() {
    const files = readSectionFiles('capabilities');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            problem: f.problem || '',
            deliverables: f.deliverables || []
        }));

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        cards: cards
    };

    writeJson('capabilities.json', result);
}

if (require.main === module) {
    buildCapabilities();
}

module.exports = buildCapabilities;
