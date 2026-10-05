const { readSectionFiles, writeJson } = require('./parser');

function buildEvidence() {
    const files = readSectionFiles('evidence');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            title: f.title || '',
            description: f._body || f.description || '',
            type: f.type || '',
            date: f.date || '',
            author: f.author || '',
            related: f.related || '',
            insights: f.insights || []
        }));

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        sub: section.sub || '',
        cards: cards
    };

    writeJson('evidence.json', result);
}

if (require.main === module) {
    buildEvidence();
}

module.exports = buildEvidence;
