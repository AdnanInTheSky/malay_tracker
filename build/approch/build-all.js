const buildSection1 = require('./build-section1');
const buildSection2 = require('./build-section2');
const buildSection3 = require('./build-section3');
const buildSection4 = require('./build-section4');
const buildSection5 = require('./build-section5');
const buildSection6 = require('./build-section6');
const buildSection7 = require('./build-section7');
const buildSection8 = require('./build-section8');

function buildAllApproch() {
    console.log('--- Starting build: Generating JSON for Approach page (content/approch -> data/approch) ---');

    const builds = [
        { name: 'section1.json', fn: buildSection1 },
        { name: 'section2.json', fn: buildSection2 },
        { name: 'section3.json', fn: buildSection3 },
        { name: 'section4.json', fn: buildSection4 },
        { name: 'section5.json', fn: buildSection5 },
        { name: 'section6.json', fn: buildSection6 },
        { name: 'section7.json', fn: buildSection7 },
        { name: 'section8.json', fn: buildSection8 }
    ];

    let errors = 0;
    for (const b of builds) {
        try {
            b.fn();
        } catch (err) {
            console.error(`Failed to build ${b.name}:`, err);
            errors++;
        }
    }

    if (errors === 0) {
        console.log(`\n✓ Successfully generated all ${builds.length} JSON files into data/approch/`);
    } else {
        console.error(`\nBuild finished with ${errors} errors.`);
        if (require.main === module) {
            process.exit(1);
        } else {
            throw new Error(`Build finished with ${errors} errors.`);
        }
    }
}

if (require.main === module) {
    buildAllApproch();
}

module.exports = buildAllApproch;
