const { readSectionFiles, writeJson } = require('./parser');

function buildOrganization() {
    const files = readSectionFiles('organization');
    const org = files[0] || {};

    const result = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "legalName": org.legalName || '',
        "alternateName": org.alternateName || '',
        "url": org.url || '',
        "email": org.email || '',
        "telephone": org.telephone || '',
        "address": {
            "@type": "PostalAddress",
            "streetAddress": org.streetAddress || '',
            "addressLocality": org.addressLocality || '',
            "postalCode": org.postalCode || '',
            "addressCountry": org.addressCountry || ''
        }
    };

    writeJson('organization.json', result);
}

if (require.main === module) {
    buildOrganization();
}

module.exports = buildOrganization;
