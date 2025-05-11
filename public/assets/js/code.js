let data;

let currentExercise;

const TREBLE_QUIZZES = [
    'A,2', 'B,2', 'C2', 'D2', 'E2', 'F2', 'G2', 'A2', 'B2', 'C\'2', 'D\'2', 'E\'2', 'F\'2', 'G\'2', 'A\'2', 'B\'2', 'C\'\'2'
];
const BASS_PREFIX = 'V: V1 clef=bass\n';
const BASS_QUIZZES = [
    'C,,2', 'D,,2', 'E,,2', 'F,,2', 'G,,2', 'A,,2', 'B,,2', 'C,2', 'D,2', 'E,2', 'F,2', 'G,2', 'A,2', 'B,2', 'C2', 'D2', 'E2'
];

const initialize = function () {
    const jsonData = localStorage.getItem("data");
    if (!jsonData) {
        data = [];
        for (let i = 0; i < 3; i++) {
            let exercise = {
                latest: 0,
                boxes: []
            };
            data.push(exercise);
            for (let j = 0; j < 5; j++) {
                exercise.boxes.push({
                    count: 0,
                    stack: []
                });
            }
        }
        TREBLE_QUIZZES.forEach(item => {
            data[0].boxes[2].stack.push({ query: item, ans: item[0], count: 0, serial: 0 });
            data[2].boxes[2].stack.push({ query: `%%staves {V1 V2}\nV: V1 clef=treble\nV: V2 clef=bass\n[V: V1]${item}\n[V: V2]S`, ans: item[0], count: 0, serial: 0 });
        });
        BASS_QUIZZES.forEach(item => {
            data[1].boxes[2].stack.push({ query: BASS_PREFIX + item, ans: item[0], count: 0, serial: 0 });
            data[2].boxes[2].stack.push({ query: `%%staves {V1 V2}\nV: V1 clef=treble\nV: V2 clef=bass\n[V: V1]S\n[V: V2]${item}`, ans: item[0], count: 0, serial: 0 });

        });
        localStorage.setItem("data", JSON.stringify(data));
    } else {
        data = JSON.parse(jsonData);
    }

    document.querySelector('.home').style.display = 'none';
    document.querySelector('.challenge').style.display = 'inline';

    updateCounters();
    nextChallenge();
};

const begin = function (exercise) {
    currentExercise = exercise;
    initialize();
};

let updateCounters = function () {
    document.querySelector(".uno").innerHTML = data[currentExercise].boxes[0].stack.length;
    document.querySelector(".dos").innerHTML = data[currentExercise].boxes[1].stack.length;
    document.querySelector(".tres").innerHTML = data[currentExercise].boxes[2].stack.length;
    document.querySelector(".cuatro").innerHTML = data[currentExercise].boxes[3].stack.length;
    document.querySelector(".cinco").innerHTML = data[currentExercise].boxes[4].stack.length;
};

let currentChallenge = {
    idxBox: -1,
    idxChallenge: -1,
    challenge: null
};

const nextChallenge = function () {
    document.querySelector('#stop').style.display = 'inline';
    document.querySelector('#start').style.display = 'none';
    document.querySelector(".timer").innerHTML = "";
    document.querySelector("#right").innerHTML = "";
    document.querySelector("#wrong").innerHTML = "";
    // buscar la siguiente pregunta
    // si está en la primera pasada, pillar el challenge de la caja central
    if (isInInitialPhase()) {
        currentChallenge.idxBox = 2;
        currentChallenge.idxChallenge = Math.floor(
            Math.random() * data[currentExercise].boxes[2].stack.length);
    } else {
        // si no, buscar challenge de izquierda a derecha
        let encontrado = false;
        for (let i = 0; i < data[currentExercise].boxes.length; i++) {
            for (let j = 0; j < data[currentExercise].boxes[i].stack.length; j++) {
                if (data[currentExercise].latest == 0 || data[currentExercise].latest > data[currentExercise].boxes[i].stack[j].serial + 4) {
                    encontrado = true;
                    currentChallenge.idxBox = i;
                    currentChallenge.idxChallenge = j;
                    break;
                }
            }
            if (encontrado) {
                break;
            }
        }
    }
    currentChallenge.challenge =
        data[currentExercise].boxes[currentChallenge.idxBox].stack[currentChallenge.idxChallenge];
    data[currentExercise].latest++;
    currentChallenge.challenge.serial = data[currentExercise].latest;
    document.querySelector('#question').innerHTML = '';
    ABCJS.renderAbc('question', currentChallenge.challenge.query, { scale: 1.5 });
    if (!isInInitialPhase()) data[currentExercise].boxes[currentChallenge.idxBox].count++;
    if (currentChallenge.challenge.count > 0) {
        startTimer(2 + (data[currentExercise].boxes.length - currentChallenge.idxBox) * 3);
    } else {
        startTimer(10);
    }
};

const isInInitialPhase = function () {
    return data[currentExercise].boxes[2].stack.length > 0 && data[currentExercise].boxes[2].count === 0;
};

let timer;

const clearTimer = function () {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    clearNextChallengeTimeout();
};

const startTimer = function (time) {
    clearTimer();
    document.querySelector(".timer").innerHTML = time;
    timer = setInterval(function () {
        time--;
        document.querySelector(".timer").innerHTML = time;
        if (time === 0) {
            manageError();
        }
    }, 1000);
};

let nextChallengeTimeout;

const startNextChallengeTimeout = function (time) {
    clearNextChallengeTimeout();
    nextChallengeTimeout = setTimeout(function () {
        nextChallenge();
    }, time);
};

const clearNextChallengeTimeout = function () {
    if (nextChallengeTimeout) {
        clearTimeout(nextChallengeTimeout);
        nextChallengeTimeout = null;
    }
};

const manageError = function (answer) {
    clearTimer();
    currentChallenge.challenge.count++;
    if (currentChallenge.idxBox > 0) {
        // moverlo de caja
        data[currentExercise].boxes[currentChallenge.idxBox].stack.splice(
            currentChallenge.idxChallenge,
            1
        );
        //data[currentChallenge.idxBox].count--;
        data[currentExercise].boxes[currentChallenge.idxBox - 1].stack.push(currentChallenge.challenge);
        //data[currentChallenge.idxBox - 1].count++;
    }
    saveData();
    document.querySelector('#wrong').innerHTML = mapNote(answer);
    document.querySelector('#right').innerHTML = mapNote(currentChallenge.challenge.ans);
    startNextChallengeTimeout(3000);
};

const mapNote = function (value) {
    switch (value) {
        case 'A': return 'la'; break;
        case 'B': return 'si'; break;
        case 'C': return 'do'; break;
        case 'D': return 're'; break;
        case 'E': return 'mi'; break;
        case 'F': return 'fa'; break;
        case 'G': return 'sol'; break;
        default: return '';
    }
}

const manageSuccess = function (value) {
    clearTimer();
    document.querySelector('#right').innerHTML = mapNote(value);
    currentChallenge.challenge.count++;
    if (currentChallenge.idxBox < data[currentExercise].boxes.length - 1) {
        // moverlo de caja
        data[currentExercise].boxes[currentChallenge.idxBox].stack.splice(
            currentChallenge.idxChallenge,
            1
        );
        //data[currentChallenge.idxBox].count--;
        data[currentExercise].boxes[currentChallenge.idxBox + 1].stack.push(currentChallenge.challenge);
        //data[currentChallenge.idxBox + 1].count++;
    }
    saveData();
    startNextChallengeTimeout(1000);
};

const saveData = function () {
    localStorage.setItem("data", JSON.stringify(data));
    updateCounters();
};

const clickNote = function (value) {
    if (!timer) return false;
    if (currentChallenge.challenge.ans[0] == value) {
        manageSuccess(value);
    } else {
        manageError(value);
    }
};

const reset = function () {
    if (confirm("¿Quieres eliminar todos tus avances?")) {
        localStorage.removeItem("data");
    }
};

const stop = function () {
    clearTimer();
    document.querySelector('#stop').style.display = 'none';
    document.querySelector('#start').style.display = 'inline';
};

const start = function () {
    nextChallenge();
    document.querySelector('#stop').style.display = 'inline';
    document.querySelector('#start').style.display = 'none';
};

const home = function () {
    clearTimer();
    document.querySelector('.home').style.display = 'inline';
    document.querySelector('.challenge').style.display = 'none';
};

const renderHomeButtons = function () {
    ABCJS.renderAbc('practice-treble', 'C2');
    ABCJS.renderAbc('practice-bass', 'V: V1 clef=bass\n[V: V1]C,2');
    ABCJS.renderAbc('practice-grand', '%%staves {V1 V2}\nV: V1 clef=treble\nV: V2 clef=bass\n[V: V1]C2\n[V: V2]C,2');
};

window.onload = () => {
    'use strict';
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function (err) {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
    renderHomeButtons();
}