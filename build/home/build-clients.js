const { readSectionFiles, writeJson } = require('./parser');

function buildClients() {
    const files = readSectionFiles('clients');
    const section = files.find(f => f.filename === 'section.md') || {};
    const logos = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            name: f.name || '',
            logo: f.logo || ''
        }));

    const result = {
        tagline: section.tagline || '',
        title: section.title || '',
        description: section.description || '',
        logos: logos
    };

    writeJson('clients.json', result);
}

if (require.main === module) {
    buildClients();
}

module.exports = buildClients;
