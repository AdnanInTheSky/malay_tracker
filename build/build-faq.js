const { readSectionFiles, writeJson } = require('./parser');

function buildFaq() {
    const files = readSectionFiles('faq');
    const section = files.find(f => f.filename === 'section.md') || {};
    const items = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            question: f.question || '',
            answer: f._body || f.answer || ''
        }));

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        items: items
    };

    writeJson('faq.json', result);
}

if (require.main === module) {
    buildFaq();
}

module.exports = buildFaq;
