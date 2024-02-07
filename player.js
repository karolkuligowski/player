document.addEventListener('DOMContentLoaded', function() {
    var gridContainer = document.getElementById('gridContainer');
    var audioInput = document.getElementById('audioInput');
    var playButton = document.getElementById('playButton');

    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            var gridItem = document.createElement('div');
            gridItem.className = 'grid-item';
            gridContainer.appendChild(gridItem);
        }
    }

    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    var dataArray = new Uint8Array(analyser.frequencyBinCount);
    var source;

    function updateGrid() {
        analyser.getByteFrequencyData(dataArray);

        for (var i = 0; i < dataArray.length; i++) {
            var gridItem = gridContainer.children[i];
            var scale = dataArray[i] / 256;
            var brightness = Math.floor(scale * 255);
            gridItem.style.backgroundColor = 'rgb(' + brightness + ',' + brightness + ',' + brightness + ')';
        }

        requestAnimationFrame(updateGrid);
    }

    function loadAndPlayAudio(file) {
        var reader = new FileReader();

        reader.onload = function(event) {
            audioContext.resume().then(function() {
                if (source) {
                    source.stop();
                }

                audioContext.decodeAudioData(event.target.result, function(buffer) {
                    source = audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(analyser);
                    analyser.connect(audioContext.destination);
                    source.start(0);
                    updateGrid();
                });
            });
        };

        reader.readAsArrayBuffer(file);
    }

    audioInput.addEventListener('change', function(event) {
        var file = event.target.files[0];

        if (file) {
            loadAndPlayAudio(file);
            playButton.disabled = false;
        }
    });

    playButton.addEventListener('click', function() {
        if (source) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            if (source.context.state === 'suspended') {
                source.context.resume();
            }

            if (source.buffer) {
                source.start(0);
                updateGrid();
            }
        }
    });
});