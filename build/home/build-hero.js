const { readSectionFiles, writeJson } = require('./parser');

function buildHero() {
    const files = readSectionFiles('hero');
    const section = files.find(f => f.filename === 'section.md') || {};
    const slides = files
        .filter(f => f.filename.startsWith('slide-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(({ filename, order, _body, ...rest }) => rest);

    const result = {
        data: {
            eyebrow: section.eyebrow || '',
            h1: section.h1 || '',
            sub: section.sub || '',
            reassurance: section.reassurance || []
        },
        slides: slides
    };

    writeJson('hero.json', result);
}

if (require.main === module) {
    buildHero();
}

module.exports = buildHero;
