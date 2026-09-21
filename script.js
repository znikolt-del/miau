const btn = document.getElementById('actionBtn');
const container = document.getElementById('container');

btn.addEventListener('click', () => {
  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  bubble.style.backgroundColor = randomColor;
  
  container.appendChild(bubble);
});
