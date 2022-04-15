const btn = document.querySelector('#one')
const output = document.querySelector('#output')

// add event listeners after a short delay
setTimeout(() => {
  btn.addEventListener('click', () => {
    output.innerText = 'clicked'
  })
}, 1000)
