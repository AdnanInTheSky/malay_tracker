const { readSectionFiles, writeJson } = require('./parser');

function buildEngagements() {
    const files = readSectionFiles('engagements');
    const section = files.find(f => f.filename === 'section.md') || {};
    
    const caseCards = files
        .filter(f => f.type === 'engagement' || f.filename.startsWith('case-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            title: f.title || '',
            description: f._body || f.description || '',
            client: f.client || '',
            duration: f.duration || '',
            outcomes: f.outcomes || []
        }));

    const adviseCards = files
        .filter(f => f.type === 'advisory' || f.filename.startsWith('advisory-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            image: f.image || '',
            title: f.title || '',
            quote: f._body || f.quote || ''
        }));

    const result = {
        data: {
            eyebrow: section.eyebrow || '',
            h2: section.h2 || '',
            cards: caseCards
        },
        adviseData: {
            tagline: section.adviseTagline || '',
            title: section.adviseTitle || '',
            description: section.adviseDescription || '',
            cards: adviseCards
        }
    };

    writeJson('engagements.json', result);
}

if (require.main === module) {
    buildEngagements();
}

module.exports = buildEngagements;
