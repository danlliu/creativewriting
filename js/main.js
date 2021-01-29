
let output_samp = document.getElementById('output');
let text_field = document.getElementById('program');
let debug_text = document.getElementById('debug');

const KEYWORDS = [
    "the", "after",
    "am", "i'm", "be", "are", "you're", "we're", "they're", "is", "he's", "she's", "it's", "was", "were", "being", "been",
    "took", "take", "gave", "give", "these", "no", "out", "say", "any", "not", "all", "after", "use", "using", "used",
    "none", "must", "like", "go", "back", "if", "other", "over"
];

const REGISTERS = [
    "am", "i'm", "be", "are", "you're", "we're", "they're", "is", "he's", "she's", "it's", "was", "were", "being", "been"
];

let registers = [0, 0, 0, 0, 0, 0, 0, 0];
let stack = [];
let output = "";
let output_err = false;

function hide_debug() {
    text_field.removeAttribute('hidden');
    debug_text.setAttribute('hidden', "spawn more overlords");
    document.getElementById('sh_dbg').removeAttribute('hidden');
    document.getElementById('hd_dbg').setAttribute('hidden', 'hehe');
}

function show_debug() {
    debug_text.removeAttribute('hidden');
    text_field.setAttribute('hidden', "you must construct additional pylons");
    document.getElementById('hd_dbg').removeAttribute('hidden');
    document.getElementById('sh_dbg').setAttribute('hidden', 'hehe');

    // sTyLiStIc tExT
    let text = text_field.value;
    let paragraphs = text.split(/\n+/);

    let dt = "";

    for (let paragraph of paragraphs) {
        let words = paragraph.split(/[^A-Za-z']+/);
        words = words.filter(x => x !== '');
        let wi = 0;
        let separators = paragraph.split(/[A-Za-z']+/);
        separators = separators.filter(x => x !== '');
        let si = 0;
        let turn = words.length < separators.length ? 1 : 0;
        let state = "none";

        while (wi < words.length || si < separators.length) {

            if (turn === 0) {
                // words
                word = words[wi];
                if (state === "none") {
                    // check keyword
                    if (KEYWORDS.includes(word.toLowerCase())) {
                        // keyword!
                        if (word.toLowerCase() === "took" || word.toLowerCase() === "take") {
                            dt += `<span style="font-weight: bolder; color: #70F">${word}</span>`;
                            state = "take";
                        } else if (word.toLowerCase() === "gave" || word.toLowerCase() === "give") {
                            dt += `<span style="font-weight: bolder; color: #07F">${word}</span>`;
                            state = "give";
                        } else if (word.toLowerCase() === "after") {
                            dt += `<span style="font-weight: bolder; color: #F33">${word}</span>`;
                            state = "after";
                        } else if (word.toLowerCase() === "the") {
                            dt += `<span style="font-weight: bolder; color: #888">${word}</span>`;
                            state = "the";
                        } else if (word.toLowerCase() === "other" || word.toLowerCase() === "over") {
                            dt += `<span style="font-weight: bolder; color: #888">${word}</span>`;
                            state = "over";
                        } else if (word.toLowerCase() === "if") {
                            dt += `<span style="font-weight: bolder; color: #963">${word}</span>`;
                            state = "if";
                        } else if (word.toLowerCase() === "go") {
                            dt += `<span style="font-weight: bolder; color: #963">${word}</span>`;
                            if (words[wi + 1] === "back") {
                                state = "back";
                            } else {
                                state = "none";
                            }
                        } else if (REGISTERS.includes(word.toLowerCase())) {
                            dt += `<span style="font-weight: bold; color: #F0F">${word}</span>`;
                        } else {
                            dt += `<span style="font-weight: bolder; color: #F70">${word}</span>`;
                        }
                    } else {
                        dt += `${word}`;
                    }
                } else if (state === "take") {
                    if (REGISTERS.includes(word.toLowerCase())) {
                        dt += `<span style="font-weight: bolder; color: #70F">${word}</span>`;
                        state = "none";
                    } else {
                        dt += `${word}`;
                    }
                } else if (state === "give") {
                    if (REGISTERS.includes(word.toLowerCase())) {
                        dt += `<span style="font-weight: bolder; color: #07F">${word}</span>`;
                        state = "none";
                    } else {
                        dt += `${word}`;
                    }
                } else if (state === "after") {
                    if (word.toLowerCase() === "the") {
                        dt += `<span style="font-weight: bold; color: #0C3">${word}</span>`;
                        state = "after the";
                    } else {
                        dt += `<span style="font-weight: bolder; color: #F33">${word}</span>`;
                        state = "none";
                    }
                } else if (state === "after the") {
                    dt += `<span style="font-weight: bolder; color: #F33">${word}</span>`;
                    state = "none";
                } else if (state === "if") {
                    if (word.toLowerCase() === "go") {
                        dt += `<span style="font-weight: bolder; color: #963">${word}</span>`;
                        if (words[wi + 1] === "back") {
                            state = "back";
                        } else {
                            state = "none";
                        }
                    } else {
                        dt += `${word}`;
                    }
                } else if (state === "back") {
                    dt += `<span style="font-weight: bolder; color: #963">${word}</span>`;
                    state = "none";
                } else if (state === "the") {
                    if (KEYWORDS.includes(word.toLowerCase())) {
                        dt += `<span style="font-weight: bolder; color: #888">${word}</span>`;
                        state = "none";
                    } else {
                        dt += `${word}`;
                    }
                } else {
                    // over
                    dt += `<span style="font-weight: bolder; color: #888">${word}</span>`;
                }
                wi += 1;
                turn = 1;
            } else {
                dt += `${separators[si]}`;
                si += 1;
                turn = 0;
            }
        }
        dt += `<br><br>`;
    }

    debug_text.innerHTML = dt;

}

function run() {

    registers = [0, 0, 0, 0, 0, 0, 0, 0];
    stack = [];
    output = "";
    output_err = false;

    let text = text_field.value.toLowerCase();
    text.replace(/\s+/gi, ' ');
    text = text.replace(/[^A-Za-z' \n]/gi, '');

    let paragraphs = text.split(/\n+/);
    let words = paragraphs.map(s => s.split(" "));
    let current_paragraph = 0;
    let word_idx = 0;

    let state = "none";
    let branch_target = 0;

    let steps = 0;

    while (current_paragraph >= 0 && current_paragraph < paragraphs.length && !output_err) {
        let word = words[current_paragraph][word_idx];

        if (state === "skip") {
            if (KEYWORDS.includes(word)) {
                state = "none";
            }
        }
        else if (state === "after") {
            if (word !== "the") {
                stack.push(word.length);
                state = "none";
            }
            else {
                state = "after the";
            }
        }
        else if (state === "after the") {
            stack.push(word.length);
            state = "none";
        }
        else if (state === "take") {
            if (REGISTERS.includes(word)) {
                // register!
                if (stack.length === 0) {
                    output_err = true;
                    output += `<br>Error! Trying to take from the stack when the stack is empty!`;
                } else {
                    registers[REGISTERS.indexOf(word)] = stack.pop();
                    state = "none";
                }
            }
        }
        else if (state === "give") {
            if (REGISTERS.includes(word)) {
                // register!
                stack.push(registers[REGISTERS.indexOf(word)]);
                state = "none";
            }
        }
        else if (state === "if") {
            if (word === "go") {
                if (words[current_paragraph][word_idx + 1] === "back") {
                    registers[7] = current_paragraph;
                }
                let a = stack.pop();
                let b = stack.pop();
                if (a === b) {
                    current_paragraph = branch_target - 1;
                    word_idx = 0;
                    state = "none";
                    continue;
                } else {
                    state = "none";
                }
            }
        }
        else {
            switch (word) {
                case "the":
                    state = "skip";
                    break;
                case "these":
                    // add
                    if (stack.length < 2) {
                        output_err = true;
                        output += `<br>Error! Trying to add top two elements on stack, but stack doesn't have 2 elements!`;
                    } else {
                        let a = stack.pop();
                        let b = stack.pop();
                        stack.push(a + b);
                    }
                    break;
                case "no":
                    if (stack.length === 0) {
                        output_err = true;
                        output += `<br>Error! Cannot negate top of empty stack since there is no top!`;
                    } else {
                        let a = stack.pop();
                        stack.push(-a);
                    }
                    break;
                case "all":
                    if (stack.length < 2) {
                        output_err = true;
                        output += `<br>Error! Trying to bitwise AND top two elements on stack, but stack doesn't have 2 elements!`;
                    } else {
                        let a = stack.pop();
                        let b = stack.pop();
                        stack.push(a & b);
                    }
                    break;
                case "any":
                    if (stack.length < 2) {
                        output_err = true;
                        output += `<br>Error! Trying to bitwise OR top two elements on stack, but stack doesn't have 2 elements!`;
                    } else {
                        let a = stack.pop();
                        let b = stack.pop();
                        stack.push(a | b);
                    }
                    break;
                case "not":
                    if (stack.length === 0) {
                        output_err = true;
                        output += `<br>Error! Trying to invert bits of top of empty stack!`;
                    } else {
                        let a = stack.pop();
                        stack.push(~a);
                    }
                    break;
                case "must":
                    if (stack.length < 2) {
                        output_err = true;
                        output += `<br>Error! Trying to find max of top two elements on stack, but stack doesn't have 2 elements!`;
                    } else {
                        let a = stack.pop();
                        let b = stack.pop();
                        stack.push(a > b ? a : b);
                    }
                    break;
                case "take":
                case "took":
                    state = "take";
                    break;
                case "gave":
                case "give":
                    state = "give";
                    break;
                case "after":
                    state = "after";
                    break;
                case "none":
                    stack.push(0);
                    break;
                case "use":
                case "using":
                case "used":
                    stack.pop();
                    break;
                case "like":
                    if (stack.length === 0) {
                        output_err = true;
                        output += `<br>Error! Trying to copy the top of an empty stack!`;
                    }
                    let e = stack.pop();
                    stack.push(e);
                    stack.push(e);
                    break;
                case "if":
                    state = "if";
                    branch_target = stack.pop();
                    break;
                case "go":
                    branch_target = stack.pop();
                    current_paragraph = branch_target - 1;
                    word_idx = -1; // gets incremented to 0
                    break;
                case "other":
                case "over":
                    current_paragraph += 1;
                    word_idx = 0;
                    break;
                case "out": {
                    let top = stack.pop();
                    stack.push(top);
                    output += `${top}`;
                }
                    break;
                case "say": {
                    let top = stack.pop();
                    stack.push(top);
                    output += `${String.fromCharCode(top)}` === `\n` ? `<br>` : `${String.fromCharCode(top)}`;
                }
                    break;
            }
        }
        word_idx += 1;
        steps += 1;
        if (current_paragraph < 0 || current_paragraph >= paragraphs.length) {
            break;
        }
        if (word_idx === words[current_paragraph].length) {
            word_idx = 0;
            current_paragraph += 1;
            if (state !== "none") {
                output_err = true;
                output += `\nError: unterminated command in paragraph ${current_paragraph}`;
            }
        }
    }

    output_samp.innerHTML = output;
    if (output_err) {
        output_samp.style.color = "#F00";
    } else {
        output_samp.style.color = "#FFF";
    }

}
