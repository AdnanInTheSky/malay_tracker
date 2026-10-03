const buildHero = require('./build-hero');
const buildMandates = require('./build-mandates');
const buildCapabilities = require('./build-capabilities');
const buildWhyIp3 = require('./build-why-ip3');
const buildSectors = require('./build-sectors');
const buildTranslation = require('./build-translation');
const buildEngagements = require('./build-engagements');
const buildResearch = require('./build-research');
const buildEvidence = require('./build-evidence');
const buildConvening = require('./build-convening');
const buildClients = require('./build-clients');
const buildEndorsements = require('./build-endorsements');
const buildDeck = require('./build-deck');
const buildPublications = require('./build-publications');
const buildLeadership = require('./build-leadership');
const buildContact = require('./build-contact');
const buildFaq = require('./build-faq');
const buildOrganization = require('./build-organization');

console.log('--- Starting build: Generating JSON from content/ ---');

const builds = [
    { name: 'hero.json', fn: buildHero },
    { name: 'mandates.json', fn: buildMandates },
    { name: 'capabilities.json', fn: buildCapabilities },
    { name: 'why-ip3.json', fn: buildWhyIp3 },
    { name: 'sectors.json', fn: buildSectors },
    { name: 'translation.json', fn: buildTranslation },
    { name: 'engagements.json', fn: buildEngagements },
    { name: 'research.json', fn: buildResearch },
    { name: 'evidence.json', fn: buildEvidence },
    { name: 'convening.json', fn: buildConvening },
    { name: 'clients.json', fn: buildClients },
    { name: 'endorsements.json', fn: buildEndorsements },
    { name: 'deck.json', fn: buildDeck },
    { name: 'publications.json', fn: buildPublications },
    { name: 'leadership.json', fn: buildLeadership },
    { name: 'contact.json', fn: buildContact },
    { name: 'faq.json', fn: buildFaq },
    { name: 'organization.json', fn: buildOrganization }
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
    console.log(`\n✓ Successfully generated all ${builds.length} JSON files into data/`);
} else {
    console.error(`\nBuild finished with ${errors} errors.`);
    process.exit(1);
}
