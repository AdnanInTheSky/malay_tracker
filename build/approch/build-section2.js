const { readSectionFiles, writeJson } = require('./parser');

function buildSection2() {
    const files = readSectionFiles('section2');
    const section = files.find(f => f.filename === 'section.md') || {};
    const items = files
        .filter(f => f.filename.startsWith('item-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            category: f.category || '',
            image: f.image || ''
        }));

    const result = {
        subtitle: section.subtitle || '',
        title: section.title || '',
        paragraph: section.paragraph || '',
        items: items
    };

    writeJson('section2.json', result);
}

if (require.main === module) {
    buildSection2();
}

module.exports = buildSection2;
