const { readSectionFiles, writeJson } = require('./parser');

function buildMandates() {
    const files = readSectionFiles('mandates');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            description: f._body || f.description || ''
        }));

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        body: section._body || section.body || '',
        cards: cards
    };

    writeJson('mandates.json', result);
}

if (require.main === module) {
    buildMandates();
}

module.exports = buildMandates;
