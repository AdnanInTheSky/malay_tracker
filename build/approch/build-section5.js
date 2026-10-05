const { readSectionFiles, writeJson } = require('./parser');

function buildSection5() {
    const files = readSectionFiles('section5');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename.startsWith('standard-'))
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

    writeJson('section5.json', result);
}

if (require.main === module) {
    buildSection5();
}

module.exports = buildSection5;
