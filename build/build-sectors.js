const { readSectionFiles, writeJson } = require('./parser');

function buildSectors() {
    const files = readSectionFiles('sectors');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            title: f.title || '',
            description: f._body || f.description || '',
            focusAreas: f.focusAreas || []
        }));

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        sub: section.sub || '',
        tagline: section.tagline || '',
        cards: cards
    };

    writeJson('sectors.json', result);
}

if (require.main === module) {
    buildSectors();
}

module.exports = buildSectors;
