const btn_one = document.querySelector('#one')
const btn_two = document.querySelector('#two')
const output_one = document.querySelector('#output')
const output_two = document.querySelector('#output-two')

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
