const { readSectionFiles, writeJson } = require('./parser');

function buildSection6() {
    const files = readSectionFiles('section6');
    const section = files.find(f => f.filename === 'section.md') || {};
    const orbitItems = files
        .filter(f => f.filename.startsWith('orbit-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            label: f.label || '',
            shortLabel: f.shortLabel || '',
            description: f.description || ''
        }));

    const result = {
        subtitle: section.subtitle || '',
        title: section.title || '',
        paragraph: section.paragraph || '',
        orbitItems: orbitItems,
        iterateText: section.iterateText || '',
        tags: section.tags || [],
        questionText: section.questionText || '',
        questionAnswer: section.questionAnswer || '',
        showQuestion: section.showQuestion === true
    };

    writeJson('section6.json', result);
}

if (require.main === module) {
    buildSection6();
}

module.exports = buildSection6;
