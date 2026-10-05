const { readSectionFiles, writeJson } = require('./parser');

function buildConvening() {
    const files = readSectionFiles('convening');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            label: f.label || '',
            description: f._body || f.description || ''
        }));

    const result = {
        sectionTagline: section.sectionTagline || '',
        cards: cards
    };

    writeJson('convening.json', result);
}

if (require.main === module) {
    buildConvening();
}

module.exports = buildConvening;
