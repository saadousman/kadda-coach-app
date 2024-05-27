document.addEventListener('DOMContentLoaded', function() {
    fetch('../data/games.json')
      .then(response => response.json())
      .then(data => {
        const game = data.find(game => game.type === 'translation');
        const gameContainer = document.getElementById('translation-game');
        game.content.forEach(item => {
          const prompt = document.createElement('p');
          prompt.textContent = item.prompt;
          gameContainer.appendChild(prompt);
          const input = document.createElement('input');
          input.type = 'text';
          gameContainer.appendChild(input);
          const button = document.createElement('button');
          button.textContent = 'Submit';
          button.onclick = () => {
            if (input.value.toLowerCase() === item.answer.toLowerCase()) {
              alert('Correct!');
            } else {
              alert('Try again!');
            }
          };
          gameContainer.appendChild(button);
        });
      });
  });
  