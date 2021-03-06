var vidSynth = require('../')
var context = new (window.AudioContext || window.webkitAudioContext)()
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia


var synth = vidSynth(context)
synth.connect(context.destination)


var getCenterPixel = require('get-center-pixel')
var ctx = document.getElementById('can').getContext('2d')


// red 255 0 0
// green 0 255 0
// blue 0 0 255

function isRed (pixel) {
  return pixel.r - pixel.g - pixel.b > 0
}

function isGreen (pixel){
  return pixel.g - pixel.r - pixel.b > -50
}

function isBlue (pixel) {
  return pixel.b - pixel.r - pixel.g > 0
}





var chords = ['E4', 'G4', 'B4', 'D5', 'E5']

// map color to chord?
var currentDesire = 'red'
var currentChord = 'E4'

function maybeChange () {
  if(Math.random() < 0.025){
    currentDesire = ['red', 'green', 'blue'][~~(Math.random() * 3)]
    currentChord = chords[~~(Math.random() * 5)]
    synth.updateNote(currentChord)

    stateYourDesire()
    console.log(currentDesire, currentChord)
  }
}

var display = document.getElementById('display')

function stateYourDesire () {
  var des = ['I DEMAND YOU SHOW ME ', 'I THIRST FOR ', 'BRING ME SOME '][~~(Math.random() * 3)] + currentDesire
  display.textContent = des
  var msg = new SpeechSynthesisUtterance(des);
    window.speechSynthesis.speak(msg);
}

function down () {
  if(synth.root.detune.value < 0) {
    synth.root.detune.value += (Math.random() * 5)
  } else {
    synth.root.detune.value -= (Math.random() * 5)
  }
  if(synth.third.detune.value < 0) {
    synth.third.detune.value += (Math.random() * 5)
  } else {
    synth.third.detune.value -= (Math.random() * 5)
  }
  if(synth.fifth.detune.value < 0) {
    synth.fifth.detune.value += (Math.random() * 5)
  } else {
    synth.fifth.detune.value -= (Math.random() * 5)
  }

  if (synth.delay.delayTime.value > 1){
    synth.delay.delayTime.value -= 0.05
  }

  if (synth.lowFilter.frequency.value > 750){
    synth.lowFilter.frequency.value -= ~~((Math.random() * 5) - 2)
  }
  return (~~Math.abs(synth.root.detune.value) <= 1 && ~~Math.abs(synth.third.detune.value) <= 1 && ~~Math.abs(synth.fifth.detune.value) <= 1)
}

function up () {
  synth.root.detune.value += ((Math.random() * 5) - 2)
  synth.fifth.detune.value += ((Math.random() * 5) - 2)
  synth.third.detune.value += ((Math.random() * 5) - 2)
  synth.lowFilter.frequency.value += ((Math.random() * 5) - 2)
  if(synth.lowFilter.frequency.value > 15000){
    synth.lowFilter.frequency.value -= (Math.random() * 500)
  }
  if (synth.delay.delayTime.value < 14.945){
    synth.delay.delayTime.value += 0.05
  }
}

gumDropMagic(function(pixel){
  // IF the pixel is within threshhold of current color desires, lower detuning
  // else, increase detuning
  display.style.backgroundColor = 'rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ')'

  if (currentDesire == 'red') {
    if (isRed(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  } else if (currentDesire == 'green') {
    if (isGreen(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  } else if (currentDesire == 'blue') {
    if (isBlue(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  }
})



function gumDropMagic (cb){
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, function (stream) {
      var video = document.getElementById('video')
      video.src = window.URL.createObjectURL(stream)
      video.onloadedmetadata = function (e) {
        video.play()
        synth.start()
        stateYourDesire()

        function draw () {
          ctx.drawImage(video, 0, 0, 320, 240)
          var data = ctx.getImageData(0, 0, 320, 240).data
          var pixel = getCenterPixel(data, 320, 240)
          cb(pixel)
          requestAnimationFrame(draw)
        }
        draw()

        cb(true)
      } // error callback: how to attempt to get just audio if video fails?
    }, function (err)  {
        document.body.textContent = 'sorry gosh, wow, something horrible must have happened'
      })
  } else {
    document.body.textContent = 'sorry yr device does not have a webcam or something whoops'
  }
}