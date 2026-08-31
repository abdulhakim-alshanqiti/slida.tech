// Interactive math: polished rectangle area visualizer
const card = LiveKit.el('div', {
  style: {
    width: '100%',
    maxWidth: '620px',
    margin: '0 auto',
    padding: '24px',
    boxSizing: 'border-box',
    borderRadius: '18px',
    background: '#1F1D26',
    border: '1px solid #35323F',
    fontFamily: 'Inter, system-ui, sans-serif',
    color: '#F5F3F8',
    boxShadow: '0 12px 35px rgba(0,0,0,0.18)'
  }
});

const title = LiveKit.el('div', {
  style: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '4px'
  }
}, 'Rectangle Area');

const subtitle = LiveKit.el('div', {
  style: {
    fontSize: '13px',
    color: '#9E9AA9',
    marginBottom: '20px'
  }
}, 'Adjust the dimensions to see how the area changes.');

const controls = LiveKit.el('div', {
  style: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    marginBottom: '0px'
  }
});

const svg = LiveKit.el('svg', {
  width: '100%',
  viewBox: '0 0 560 340',
  style: {
    display: 'block',
    overflow: 'visible'
  }
});

const output = LiveKit.el('div', {
  style: {
    marginTop: '0px',
    padding: '14px 18px',
    borderRadius: '12px',
    background: '#292631',
    textAlign: 'center',
    fontSize: '17px',
    fontWeight: '600',
    color: '#E8A33D'
  }
});

function makeControl(label, min, max, value) {
  const valueText = LiveKit.el('span', {
    style: {
      minWidth: '42px',
      textAlign: 'right',
      color: '#E8A33D',
      fontWeight: '700',
      fontVariantNumeric: 'tabular-nums'
    }
  }, String(value));

  const slider = LiveKit.el('input', {
    type: 'range',
    min,
    max,
    value,
    style: {
      flex: '1',
      accentColor: '#E8A33D',
      cursor: 'pointer'
    }
  });

  slider.addEventListener('input', () => {
    valueText.textContent = slider.value;
    draw();
  });

  const row = LiveKit.el('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, [
    LiveKit.el('span', {
      style: {
        width: '62px',
        fontSize: '14px',
        color: '#D9D6E0'
      }
    }, label),
    slider,
    valueText
  ]);

  return { slider, row };
}

const widthControl = makeControl('Width', 10, 200, 120);
const heightControl = makeControl('Height', 10, 200, 90);

controls.appendChild(widthControl.row);
controls.appendChild(heightControl.row);

function drawArrow(x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size = 7;

  const p1 = `${x2 - size * Math.cos(angle - Math.PI / 6)},${y2 - size * Math.sin(angle - Math.PI / 6)}`;
  const p2 = `${x2 - size * Math.cos(angle + Math.PI / 6)},${y2 - size * Math.sin(angle + Math.PI / 6)}`;

  svg.appendChild(LiveKit.el('line', {
    x1, y1, x2, y2,
    stroke: color,
    'stroke-width': 1.5
  }));

  svg.appendChild(LiveKit.el('polygon', {
    points: `${x2},${y2} ${p1} ${p2}`,
    fill: color
  }));
}

function draw() {
  const w = Number(widthControl.slider.value);
  const h = Number(heightControl.slider.value);
  const area = w * h;

  // Scale rectangle so it fits nicely in the diagram.
  const maxW = 360;
  const maxH = 220;

  const scale = Math.min(maxW / w, maxH / h);

  const rectW = w * scale;
  const rectH = h * scale;

  const x = 280 - rectW / 2;
  const y = 165 - rectH / 2;

  svg.innerHTML = '';

  // Soft shadow
  svg.appendChild(LiveKit.el('rect', {
    x: x + 5,
    y: y + 6,
    width: rectW,
    height: rectH,
    rx: 8,
    fill: '#000',
    opacity: '0.18'
  }));

  // Rectangle
  svg.appendChild(LiveKit.el('rect', {
    x,
    y,
    width: rectW,
    height: rectH,
    rx: 8,
    fill: '#E8A33D',
    stroke: '#F4C46F',
    'stroke-width': 2
  }));

  // Center formula
  svg.appendChild(LiveKit.el('text', {
    x: x + rectW / 2,
    y: y + rectH / 2 - 5,
    'text-anchor': 'middle',
    'font-size': 18,
    'font-weight': '700',
    fill: '#211807'
  }, `${w} × ${h}`));

  svg.appendChild(LiveKit.el('text', {
    x: x + rectW / 2,
    y: y + rectH / 2 + 17,
    'text-anchor': 'middle',
    'font-size': 13,
    'font-weight': '600',
    fill: '#4A350E'
  }, `Area = ${area}`));

  // Width guide
  const widthY = y + rectH + 35;

  svg.appendChild(LiveKit.el('line', {
    x1: x,
    y1: y + rectH + 8,
    x2: x,
    y2: widthY + 5,
    stroke: '#716D7C',
    'stroke-width': 1
  }));

  svg.appendChild(LiveKit.el('line', {
    x1: x + rectW,
    y1: y + rectH + 8,
    x2: x + rectW,
    y2: widthY + 5,
    stroke: '#716D7C',
    'stroke-width': 1
  }));

  drawArrow(x, widthY, x + 18, widthY, '#A7A2B2');
  drawArrow(x + rectW, widthY, x + rectW - 18, widthY, '#A7A2B2');

  svg.appendChild(LiveKit.el('text', {
    x: x + rectW / 2,
    y: widthY + 18,
    'text-anchor': 'middle',
    'font-size': 15,
    'font-weight': '600',
    fill: '#C9C5D0'
  }, `Width = ${w}`));

  // Height guide
  const heightX = x - 35;

  svg.appendChild(LiveKit.el('line', {
    x1: x - 8,
    y1: y,
    x2: heightX - 5,
    y2: y,
    stroke: '#716D7C',
    'stroke-width': 1
  }));

  svg.appendChild(LiveKit.el('line', {
    x1: x - 8,
    y1: y + rectH,
    x2: heightX - 5,
    y2: y + rectH,
    stroke: '#716D7C',
    'stroke-width': 1
  }));

  drawArrow(heightX, y, heightX, y + 18, '#A7A2B2');
  drawArrow(heightX, y + rectH, heightX, y + rectH - 18, '#A7A2B2');

  svg.appendChild(LiveKit.el('text', {
    x: heightX - 12,
    y: y + rectH / 2,
    'text-anchor': 'middle',
    'font-size': 15,
    'font-weight': '600',
    fill: '#C9C5D0',
    transform: `rotate(-90 ${heightX - 12} ${y + rectH / 2})`
  }, `Height = ${h}`));

  output.innerHTML =
    `Area = <strong>${w}</strong> × <strong>${h}</strong> = <strong>${area}</strong> square units`;
}

card.appendChild(title);
card.appendChild(subtitle);
card.appendChild(controls);
card.appendChild(svg);
card.appendChild(output);

container.appendChild(card);

draw();