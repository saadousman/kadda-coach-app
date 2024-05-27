document.addEventListener('DOMContentLoaded', function() {
    fetch('../data/games.json')
      .then(response => response.json())
      .then(data => {
        const game = data.find(game => game.type === 'comprehension');
        const gameContainer = document.getElementById('comprehension-game');
        game.content.forEach(item => {
          const passage = document.createElement('p');
          passage.textContent = item.passage;
          gameContainer.appendChild(passage);
          item.questions.forEach(question => {
            const questionElem = document.createElement('p');
            questionElem.textContent = question.q;
            gameContainer.appendChild(questionElem);
            const input = document.createElement('input');
            input.type = 'text';
            gameContainer.appendChild(input);
            const button = document.createElement('button');
            button.textContent = 'Submit';
            button.onclick = () => {
              if (input.value.toLowerCase() === question.a.toLowerCase()) {
                alert('Correct!');
              } else {
                alert('Try again!');
              }
            };
            gameContainer.appendChild(button);
          });
        });
      });
  });
  