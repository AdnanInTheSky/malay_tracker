const { readSectionFiles, writeJson } = require('./parser');

function buildSection7() {
    const files = readSectionFiles('section7');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename.startsWith('card-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            text: f.text || ''
        }));

    const result = {
        subtitle: section.subtitle || '',
        title: section.title || '',
        paragraph: section.paragraph || '',
        backgroundImage: section.backgroundImage || '',
        cards: cards,
        subsection: {
            subtitle: section.subsectionSubtitle || '',
            title: section.subsectionTitle || '',
            description: section.subsectionDescription || '',
            leftTitle: section.leftTitle || '',
            leftItems: section.leftItems || [],
            rightTitle: section.rightTitle || '',
            rightItems: section.rightItems || [],
            togetherTitle: section.togetherTitle || '',
            togetherDescription: section.togetherDescription || '',
            togetherTags: section.togetherTags || []
        }
    };

    writeJson('section7.json', result);
}

if (require.main === module) {
    buildSection7();
}

module.exports = buildSection7;
