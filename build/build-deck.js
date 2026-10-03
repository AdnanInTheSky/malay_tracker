const { readSectionFiles, writeJson } = require('./parser');

function buildDeck() {
    const files = readSectionFiles('deck');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            title: f.title || '',
            description: f._body || f.description || '',
            tag: f.tag || '',
            overview: f.overview || '',
            highlights: f.highlights || []
        }));

    const result = {
        tagline: section.tagline || '',
        title: section.title || '',
        description: section.description || '',
        tags: section.tags || [],
        cards: cards
    };

    writeJson('deck.json', result);
}

if (require.main === module) {
    buildDeck();
}

module.exports = buildDeck;
