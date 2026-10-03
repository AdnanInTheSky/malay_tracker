const { readSectionFiles, writeJson } = require('./parser');

function buildPublications() {
    const files = readSectionFiles('publications');
    const section = files.find(f => f.filename === 'section.md') || {};
    const cards = files
        .filter(f => f.filename !== 'section.md')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            title: f.title || '',
            description: f._body || f.description || '',
            tag: f.tag || '',
            authors: f.authors || '',
            published: f.published || '',
            abstract: f.abstract || '',
            takeaways: f.takeaways || []
        }));

    const result = {
        tagline: section.tagline || '',
        title: section.title || '',
        description: section.description || '',
        tags: section.tags || [],
        cards: cards
    };

    writeJson('publications.json', result);
}

if (require.main === module) {
    buildPublications();
}

module.exports = buildPublications;
