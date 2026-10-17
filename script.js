const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreValue = document.getElementById('scoreValue');
const factPopup = document.getElementById('factPopup');
const factText = document.getElementById('factText');
const closeFact = document.getElementById('closeFact');

const seaFloorY = canvas.height - 30;

const ship = {
  x: canvas.width / 2 - 55,
  y: 36,
  width: 110,
  height: 26,
  speed: 22,
};

const hook = {
  length: 0,
  speed: 8,
  state: 'idle',
  carriedItem: null,
};

let score = 0;

const entities = [
  {
    x: 120,
    y: 385,
    radius: 20,
    kind: 'trash',
    label: 'Bottle',
    color: '#8fd3ff',
    fact:
      'Plastic bottles can take around 450 years to decompose. Recycling one bottle helps keep long-lived plastic out of the ocean. (Source: NOAA Marine Debris Program)',
  },
  {
    x: 780,
    y: 430,
    radius: 18,
    kind: 'trash',
    label: 'Bag',
    color: '#ffd8a8',
    fact:
      'Plastic bags can be mistaken for food by turtles. Reusing bags and proper disposal lowers this risk. (Source: NOAA Marine Debris Program)',
  },
  {
    x: 460,
    y: 340,
    radius: 19,
    kind: 'trash',
    label: 'Can',
    color: '#d4e0ee',
    fact:
      'Aluminum cans are highly recyclable and can be back on store shelves in about 60 days when recycled. (Source: U.S. EPA)',
  },
  {
    x: 290,
    y: 410,
    radius: 26,
    kind: 'wreck',
    label: 'Wreck',
    color: '#6f4c3e',
  },
  {
    x: 630,
    y: 392,
    radius: 21,
    kind: 'animal',
    label: 'Fish',
    color: '#ffe168',
  },
  {
    x: 700,
    y: 300,
    radius: 24,
    kind: 'plant',
    label: 'Kelp',
    color: '#57c785',
  },
];

function drawShipAndHook() {
  ctx.fillStyle = '#f2f7ff';
  ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
  ctx.fillStyle = '#184d87';
  ctx.fillRect(ship.x + 18, ship.y - 10, 30, 10);

  const hookX = ship.x + ship.width / 2;
  const hookY = ship.y + ship.height + hook.length;

  ctx.strokeStyle = '#f3fbff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hookX, ship.y + ship.height);
  ctx.lineTo(hookX, hookY);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(hookX, hookY, 8, 0, Math.PI * 2);
  ctx.strokeStyle = '#fffcf2';
  ctx.stroke();

  if (hook.carriedItem) {
    hook.carriedItem.x = hookX;
    hook.carriedItem.y = hookY + hook.carriedItem.radius + 3;
  }
}

function drawEntity(entity) {
  if (entity.kind === 'plant') {
    ctx.strokeStyle = entity.color;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(entity.x, entity.y + 22);
    ctx.quadraticCurveTo(entity.x - 10, entity.y - 10, entity.x + 4, entity.y - 32);
    ctx.stroke();
    return;
  }

  ctx.fillStyle = entity.color;
  ctx.beginPath();
  ctx.arc(entity.x, entity.y, entity.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10253e';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(entity.label, entity.x, entity.y + 4);
}

function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f2f55';
  ctx.fillRect(0, seaFloorY, canvas.width, canvas.height - seaFloorY);

  entities.forEach(drawEntity);

  if (hook.carriedItem) {
    drawEntity(hook.carriedItem);
  }

  drawShipAndHook();
}

function dropHook() {
  if (hook.state === 'idle') {
    hook.state = 'dropping';
  }
}

function showFact(message) {
  factText.textContent = message;
  factPopup.classList.add('show');
  factPopup.setAttribute('aria-hidden', 'false');
}

function closeFactPopup() {
  factPopup.classList.remove('show');
  factPopup.setAttribute('aria-hidden', 'true');
}

closeFact.addEventListener('click', closeFactPopup);

function updateHook() {
  if (hook.state === 'dropping') {
    hook.length += hook.speed;
    const hookX = ship.x + ship.width / 2;
    const hookY = ship.y + ship.height + hook.length;

    let hitAny = false;

    for (let index = 0; index < entities.length; index += 1) {
      const entity = entities[index];
      const dx = hookX - entity.x;
      const dy = hookY - entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= entity.radius + 8) {
        hitAny = true;
        if (entity.kind === 'trash') {
          hook.carriedItem = entity;
          entities.splice(index, 1);
        }
        hook.state = 'rising';
        break;
      }
    }

    if (!hitAny && hookY >= seaFloorY) {
      hook.state = 'rising';
    }
  } else if (hook.state === 'rising') {
    hook.length -= hook.speed;
    if (hook.length <= 0) {
      hook.length = 0;
      hook.state = 'idle';

      if (hook.carriedItem) {
        score += 1;
        scoreValue.textContent = String(score);
        showFact(hook.carriedItem.fact);
        hook.carriedItem = null;
      }
    }
  }
}

window.addEventListener('keydown', (event) => {
  const key = event.key;

  if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowDown') {
    event.preventDefault();
  }

  if (hook.state === 'idle') {
    if (key === 'ArrowLeft') {
      ship.x = Math.max(0, ship.x - ship.speed);
    }

    if (key === 'ArrowRight') {
      ship.x = Math.min(canvas.width - ship.width, ship.x + ship.speed);
    }
  }

  if (key === 'ArrowDown' || key === 'Enter') {
    dropHook();
  }
});

function gameLoop() {
  updateHook();
  drawScene();
  requestAnimationFrame(gameLoop);
}

gameLoop();
