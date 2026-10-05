const { readSectionFiles, writeJson } = require('./parser');

function buildLeadership() {
    const files = readSectionFiles('leadership');
    const leader = files[0] || {};

    const result = {
        eyebrow: leader.eyebrow || 'LEADERSHIP',
        name: leader.name || '',
        position: leader.position || '',
        bio: leader._body || leader.bio || '',
        image: leader.image || ''
    };

    writeJson('leadership.json', result);
}

if (require.main === module) {
    buildLeadership();
}

module.exports = buildLeadership;
