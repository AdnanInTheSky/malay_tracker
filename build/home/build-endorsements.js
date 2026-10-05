const { readSectionFiles, writeJson } = require('./parser');

function buildEndorsements() {
    const files = readSectionFiles('endorsements');
    const section = files.find(f => f.filename === 'section.md') || {};
    const endorsements = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            quote: f._body || f.quote || '',
            endorser: f.endorser || '',
            title: f.title || '',
            organization: f.organization || ''
        }));

    const result = {
        tagline: section.tagline || '',
        title: section.title || '',
        description: section.description || '',
        endorsements: endorsements
    };

    writeJson('endorsements.json', result);
}

if (require.main === module) {
    buildEndorsements();
}

module.exports = buildEndorsements;
