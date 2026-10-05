const { readSectionFiles, writeJson } = require('./parser');

function buildSection3() {
    const files = readSectionFiles('section3');
    const section = files.find(f => f.filename === 'section.md') || {};
    const questionCards = files
        .filter(f => f.filename.startsWith('question-'))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(f => ({
            title: f.title || '',
            text: f.text || ''
        }));

    const result = {
        subtitle: section.subtitle || '',
        title: section.title || '',
        paragraph: section.paragraph || '',
        currentState: {
            title: section.currentStateTitle || '',
            items: section.currentStateItems || []
        },
        desiredState: {
            title: section.desiredStateTitle || '',
            items: section.desiredStateItems || []
        },
        questionCards: questionCards,
        bigCard: {
            title: section.frameworkTitle || '',
            items: section.frameworkItems || [],
            image: section.frameworkImage || ''
        }
    };

    writeJson('section3.json', result);
}

if (require.main === module) {
    buildSection3();
}

module.exports = buildSection3;
