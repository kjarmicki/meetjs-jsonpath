'use strict';

const transform = require('jsonpath-object-transform'),
    volumes = require('./volumes'),
    assert = require('assert'),
    microtime = require('microtime');

function nativeJsBooksInfo(volumes) {
    return volumes.items.map(volume => {
        let info = {
            authors: undefined,
            title: undefined,
            isbn13: undefined
        };

        try {
            info.authors = volume.volumeInfo.authors;
        } catch (e) {}
        try {
            info.title = volume.volumeInfo.title;
        } catch (e) {}
        try {
            info.isbn13 = volume.volumeInfo.industryIdentifiers
                .filter(id => id.type === 'ISBN_13')[0]
                .identifier;
        } catch (e) {}

        return info;
    });
}

function jsonPathBooksInfo(volumes) {
    const template = {
        items: ['$..items', {
            authors: '$..authors',
            title: '$..title',
            isbn13: '$..industryIdentifiers..[?(@.type === "ISBN_13")].identifier'
        }]
    };

    return transform(volumes, template).items;
}

// to make sure benchmark methods are fair
assert.deepEqual(jsonPathBooksInfo(volumes), nativeJsBooksInfo(volumes));

const repeats = 100;

const nativeStart = microtime.now();
for(let i = 0; i < repeats; i++) {
    nativeJsBooksInfo(volumes);
}
const nativeEnd = microtime.now();


const jsonPathStart = microtime.now();
for(let i = 0; i < repeats; i++) {
    jsonPathBooksInfo(volumes);
}
const jsonPathEnd = microtime.now();


console.log(`
*** RESULTS ***
Native JS:  ${(nativeEnd - nativeStart) / 1000}ms
JSON Path:  ${(jsonPathEnd - jsonPathStart) / 1000}ms

Oh noes, JSON Path is about ${Math.round((jsonPathEnd - jsonPathStart) / (nativeEnd - nativeStart))} times slower
`);