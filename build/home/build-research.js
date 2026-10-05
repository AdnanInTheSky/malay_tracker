const { readSectionFiles, writeJson } = require('./parser');

function buildResearch() {
    const files = readSectionFiles('research');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            title: f.title || '',
            description: f._body || f.description || '',
            researchType: f.researchType || '',
            region: f.region || '',
            year: String(f.year || ''),
            findings: f.findings || []
        }));

    const result = {
        tagline: section.tagline || '',
        title: section.title || '',
        description: section.description || '',
        cards: cards
    };

    writeJson('research.json', result);
}

if (require.main === module) {
    buildResearch();
}

module.exports = buildResearch;
