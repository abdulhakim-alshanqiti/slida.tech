```live
import confetti from "https://esm.sh/canvas-confetti@1.6.0"

const btn = document.createElement('button');
btn.textContent = '🎉 Click me';
btn.style.padding = '20px 20px';
btn.style.fontSize = '30px';
btn.style.borderRadius = '8px';
btn.style.border = 'none';
btn.style.cursor = 'pointer';
btn.style.background = '#E8A33D';
btn.style.color = '#1C1B22';
btn.style.width = '100%';
btn.style.boxSizing = 'border-box';

btn.addEventListener('click', (event) => {
  const rect = btn.getBoundingClientRect();
  confetti({
    particleCount: 80,
    spread: 70,
    origin: {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    }
  });
});

container.appendChild(btn);
```


---

```live
const question = document.createElement('div');
question.textContent = 'Which language runs natively in the browser?';
question.style.fontSize = '24px';
question.style.fontWeight = '700';
question.style.marginBottom = '20px';

const options = ['Python', 'JavaScript', 'Rust', 'Go'];
const correct = 1;

const choices = document.createElement('div');
choices.style.display = 'flex';
choices.style.flexDirection = 'column';
choices.style.gap = '10px';

const explanation = document.createElement('div');
explanation.style.display = 'none';
explanation.style.marginTop = '20px';
explanation.style.padding = '15px';
explanation.style.borderRadius = '8px';
explanation.style.background = '#E8F5E9';

options.forEach((option, index) => {
  const button = document.createElement('button');

  button.textContent = option;
  button.style.padding = '14px 18px';
  button.style.fontSize = '18px';
  button.style.textAlign = 'left';
  button.style.borderRadius = '8px';
  button.style.border = '1px solid #D0CDD6';
  button.style.cursor = 'pointer';
  button.style.background = '#FFFFFF';
  button.style.color = '#1C1B22';
  button.style.width = '100%';
  button.style.boxSizing = 'border-box';

  button.addEventListener('click', () => {
    if (index === correct) {
      button.style.background = '#DFF5E3';
      button.style.borderColor = '#4CAF50';

      explanation.textContent =
        '✓ Correct! JavaScript is the only one of these that browsers execute directly.';
      explanation.style.display = 'block';
    } else {
      button.style.background = '#FDE2E2';
      button.style.borderColor = '#E05252';

      explanation.textContent =
        '✗ Not quite. Try again.';
      explanation.style.display = 'block';
    }
  });

  choices.appendChild(button);
});

container.appendChild(question);
container.appendChild(choices);
container.appendChild(explanation);
```
---

# بيانات مالية

```live
const chart = LiveKit.el('div', {

});

const title = LiveKit.el('div', {
  style: {
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '4px'
  }
}, 'Finance Indices 2002');

const subtitle = LiveKit.el('div', {
  style: {
    fontSize: '13px',
    color: '#9E9AA9',
    marginBottom: '20px'
  }
}, 'Percent change since 2002.');

const chartDiv = LiveKit.el('div', {
  style: {
    width: '100%',
    height: '340px'
  }
});

chart.appendChild(title);
chart.appendChild(subtitle);
chart.appendChild(chartDiv);
container.appendChild(chart);

const myChart = echarts.init(chartDiv, null, { renderer: 'png' });

const years = ['2002', '2004', '2006', '2008', '2010'];

const series = [
  { name: 'Dow Jones', color: '#5B8FF9', data: [0, 8, 22, -12, 15] },
  { name: 'Nasdaq', color: '#E8A33D', data: [0, 12, 30, -25, 20] },
  { name: 'S&P 500', color: '#5AD8A6', data: [0, 9, 24, -18, 17] }
];

myChart.setOption({
  backgroundColor: 'transparent',

  legend: {
    top: 0,
    left: -20, 
    icon: 'roundRect',
    itemWidth: 20,
    itemHeight: 30,
  orient: 'vertical' ,
 
    textStyle: { color: '#D9D6E0',fontSize: 20}
  },
  xAxis: {
    type: 'category',
    data: years,
    boundaryGap: false,
    axisLine: { lineStyle: { color: '#35323F' } },
    axisTick: { show: false },
    axisLabel: { color: '#9E9AA9', fontSize: 12 }
  },
  yAxis: {
    type: 'value',
    axisLabel: { formatter: '{value}%', color: '#9E9AA9', fontSize: 12 },
    splitLine: { lineStyle: { color: '#2A2833' } }
  },
  tooltip: { trigger: 'axis', valueFormatter: (v) => v + '%' },
  series: series.map(s => ({
    name: s.name,
    type: 'line',
    data: s.data,
    lineStyle: { width: 2, color: s.color },
    itemStyle: { color: s.color },
    symbolSize: 6
  }))
});

window.addEventListener('resize', () => myChart.resize());
```

---

```live

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
```



---

## Sub-slides

Press ↓ during Present mode to go deeper.

--

### A deeper thought

Vertical slides are for asides and detail.

---

## Codeblocks come alive

```live
LiveKit.quiz(container, {
  question: "What powers the live blocks on this slide?",
  options: ["A plugin", "Plain executed JavaScript", "Magic"],
  correct: 1,
  explain: "Each live block is just a function run with its own container element."
});
```

---

## Ready when you are

Hit **Present** to go fullscreen, or download a standalone .html you can open anywhere.