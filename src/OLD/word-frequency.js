function wordFrequency(string) {

    //var cleanString = string.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,""),
    var lines = string.split("\n"),
        words,
        frequencies = {},
        word, frequency, i, l;

    
    for( l=0; l<lines.length; l++ ) {
        words = lines[l].split(' ');
        console.log(words);
        for( i=0; i<words.length; i++ ) {
            word = words[i];
            frequencies[word] = frequencies[word] || 0;
            frequencies[word]++;
        }
    }
    //words = Object.keys( frequencies );
    return frequencies;
    //return words.sort(function (a,b) { return frequencies[b] -frequencies[a];}).slice(0,cutOff).toString();
}

function WFCount() {
    
    var count = wordFrequency(document.getElementById('string_input').value);
    var divResult = document.getElementById('response');
    
    for (words in count) {
        divResult.innerHTML += words + ': ' + count[words] + '<BR/>';
    }
    
}
