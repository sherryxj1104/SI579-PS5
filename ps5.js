/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');
const body=document.querySelector("body");

// Stores saved words.
const savedWordsArray = [];
savedWords.textContent = " (none)";
/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 *
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
function addToSavedWords(word) {
    savedWordsArray.push(word);
    savedWords.innerHTML = `${savedWordsArray.join(", ")}`;
}

// Add additional functions/callbacks here.
function showRhymes(result) {
    if (result.length != 0) {
        const groupOutput = groupBy(result,"numSyllables");
            console.log(groupOutput);
            wordOutput.innerHTML = `<h3> Syllables: 1</h3><ul id="word_list1"></ul>`;
            wordOutput.innerHTML += `<h3> Syllables: 2</h3><ul id="word_list2"></ul>`;
            wordOutput.innerHTML += `<h3> Syllables: 3</h3><ul id="word_list3"></ul>`;
            const wordList1 = document.querySelector("#word_list1");
            const wordList2 = document.querySelector("#word_list2");
            const wordList3 = document.querySelector("#word_list3");
            for (var syllables in groupOutput) {
                const syllable = groupOutput[syllables];
                // console.log(syllable); // objects
                // console.log(syllables); // 1 2 3
                for (var syll in syllable){
                    var syllNum = syllable[syll].numSyllables;
                    var word = syllable[syll].word;
                    console.log(syllNum);
                    console.log(word);
                    if (syllNum === 1) {
                        wordList1.innerHTML += `<li>${word} <button type="button" class="btn btn-outline-success" onclick="addToSavedWords('${word}')">(Save)</button></li>`;
                    } else if (syllNum === 2) {
                        wordList2.innerHTML += `<li>${word} <button type="button" class="btn btn-outline-success" onclick="addToSavedWords('${word}')">(Save)</button></li>`;
                    } else if (syllNum === 3) {
                        wordList3.innerHTML += `<li>${word} <button type="button" class="btn btn-outline-success" onclick="addToSavedWords('${word}')">(Save)</button></li>`;
                    }
                }
            }
    } else {
        wordOutput.innerHTML =`<p>(no results)</p>`;
    }
    outputDescription.innerHTML = `<h2>Words that rhyme with ${wordInput.value}: </h2>`;
}

function showSynonyms(output) {
    if (output != 0) {
        wordOutput.innerHTML = `<ul id="word_similar"></ul>`;
        const similarWord = document.querySelector("#word_similar");
        for (var res in output){
            var words = output[res].word;
            console.log(words);
            similarWord.innerHTML += `<li>${words} <button type="button" class="btn btn-outline-success" onclick="addToSavedWords('${words}')">(Save)</button></li>`;
        };
    } else {
        wordOutput.innerHTML =`<p>(no results)</p>`;
    }
    outputDescription.innerHTML = `<h2>Words with a similar meaning to ${wordInput.value}: </h2>`;
}


// Add event listeners here.
showRhymesButton.addEventListener("click",()=>{
    wordOutput.innerHTML = `<h2>...loading</h2>`;
    datamuseRequest(getDatamuseRhymeUrl(wordInput),showRhymes);
});

body.addEventListener("keydown",(key)=>{
    if (key.code=="Enter") {
        wordOutput.innerHTML = `<h2>...loading</h2>`;
        datamuseRequest(getDatamuseRhymeUrl(wordInput),showRhymes);
    };
});

showSynonymsButton.addEventListener("click",()=>{
    wordOutput.innerHTML = `<h2>...loading</h2>`;
    datamuseRequest(getDatamuseSimilarToUrl(wordInput),showSynonyms)
});