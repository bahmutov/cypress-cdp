const btn_one = document.querySelector('#one')
const btn_two = document.querySelector('#two')
const btn_three = document.querySelector('#three')
const output_one = document.querySelector('#output')
const output_two = document.querySelector('#output-two')
const output_three = document.querySelector('#output-three')

// add event listeners after a short delay
setTimeout(() => {
  btn_one.addEventListener('click', () => {
    output.innerText = 'clicked'
  })
}, 1000)

// add event listeners after a long delay
setTimeout(() => {
  btn_two.addEventListener('click', () => {
    output_two.innerText = 'clicked'
  })
}, 5000)

setTimeout(() => {
  let new_button = document.createElement('button')
  new_button.id = 'three'
  new_button.innerText = 'Click me three!'
  new_button.addEventListener('click', () => {
    output_three.innerText = 'clicked'
  })
  btn_three.replaceWith(new_button)
}, 1000)
