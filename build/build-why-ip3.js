const { readSectionFiles, writeJson } = require('./parser');

function buildWhyIp3() {
    const files = readSectionFiles('why-ip3');
    const section = files.find(f => f.filename === 'section.md') || {};
    const reasons = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            number: f.number || '',
            title: f.title || '',
            description: f._body || f.description || '',
            link: f.link || '',
            linkText: f.linkText || ''
        }));

    const result = {
        eyebrow: section.eyebrow || '',
        h2: section.h2 || '',
        image: section.image || '',
        reasons: reasons
    };

    writeJson('why-ip3.json', result);
}

if (require.main === module) {
    buildWhyIp3();
}

module.exports = buildWhyIp3;
