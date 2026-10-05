const { readSectionFiles, writeJson } = require('./parser');

function buildSection8() {
    const files = readSectionFiles('section8');
    const section = files.find(f => f.filename === 'section.md') || {};

    const diffCards = files
        .filter(f => f.filename.startsWith('diff-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            text: f.text || ''
        }));

    const realityCards = files
        .filter(f => f.filename.startsWith('reality-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            text: f.text || ''
        }));

    const pillars = (section.pillars || []).map(p => (typeof p === 'string' ? { text: p } : p));

    const result = {
        subtitle: section.subtitle || '',
        title: section.title || '',
        paragraph: section.paragraph || '',
        backgroundImage: section.backgroundImage || '',
        cards: pillars,
        subsection1: {
            title: section.subsection1Title || '',
            paragraph: section.subsection1Paragraph || '',
            cards: diffCards
        },
        subsection2: {
            title: section.subsection2Title || '',
            paragraph: section.subsection2Paragraph || '',
            cards: realityCards
        }
    };

    writeJson('section8.json', result);
}

if (require.main === module) {
    buildSection8();
}

module.exports = buildSection8;
