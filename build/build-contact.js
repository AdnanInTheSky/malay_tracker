const { readSectionFiles, writeJson } = require('./parser');

function buildContact() {
    const files = readSectionFiles('contact');
    const section = files.find(f => f.filename === 'section.md') || {};
    const paths = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            description: f._body || f.description || ''
        }));

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        sub: section.sub || '',
        paths: paths,
        focusAreas: section.focusAreas || []
    };

    writeJson('contact.json', result);
}

if (require.main === module) {
    buildContact();
}

module.exports = buildContact;
