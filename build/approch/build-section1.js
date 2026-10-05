const { readSectionFiles, writeJson } = require('./parser');

function buildSection1() {
    const files = readSectionFiles('section1');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename.startsWith('card-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            text: f.text || ''
        }));

    const result = {
        subtitle: section.subtitle || '',
        title: section.title || '',
        paragraph: section.paragraph || '',
        buttonText: section.buttonText || '',
        backgroundImage: section.backgroundImage || '',
        backgroundVideo: section.backgroundVideo || '',
        cards: cards
    };

    writeJson('section1.json', result);
}

if (require.main === module) {
    buildSection1();
}

module.exports = buildSection1;
