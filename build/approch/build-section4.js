const { readSectionFiles, writeJson } = require('./parser');

function buildSection4() {
    const files = readSectionFiles('section4');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename.startsWith('phase-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            text: f.text || '',
            image: f.image || '',
            bullets: f.bullets || [],
            paragraph: f.paragraph || ''
        }));

    const result = {
        subtitle: section.subtitle || '',
        title: section.title || '',
        paragraph: section.paragraph || '',
        cards: cards
    };

    writeJson('section4.json', result);
}

if (require.main === module) {
    buildSection4();
}

module.exports = buildSection4;
