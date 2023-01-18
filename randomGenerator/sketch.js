let markov, data1, data2, data3;
let words, output;
let generatedContent = document.querySelector('#generatedContent');
let text = generatedContent.innerText;

function preload() {
  data1 = loadStrings('data/communist.txt'); // load in text files for markov
  data2 = loadStrings('data/utilitarianism.txt');
  data3 = loadStrings('data/john_locke.txt');
}

function setup() {
  markov = new RiMarkov (3);

  markov.loadText(data1.join(' '));
  markov.loadText(data2.join(' '));
  markov.loadText(data3.join(' '));
}

function generate(){
  words = [];
  words = markov.generateTokens(50); // creates markov chain of 20 words
  output = words.join(" ");
  generatedContent.innerText = output;
  print (output);
}
