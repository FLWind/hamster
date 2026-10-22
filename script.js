(() => {
  "use strict";

  const app = document.getElementById("quiz-app");
  const year = document.getElementById("year");

  if (year) year.textContent = String(new Date().getFullYear());
  if (!app) return;

  const kinds = ["fomo", "diamond", "panic", "analyst"];
  const questions = [
    {
      title: "В чате все обсуждают новый актив. Ты…",
      options: [
        ["Уже ищу кнопку «Купить»", "fomo"],
        ["Не отвлекаюсь от своих старых позиций", "diamond"],
        ["Переживаю, что опять что-то упущу", "panic"],
        ["Пишу подробный разбор на 17 сообщений", "analyst"],
      ],
    },
    {
      title: "Портфель внезапно покраснел. Первая мысль?",
      options: [
        ["«О, распродажа! А что ещё купить?»", "fomo"],
        ["«Я же говорил: горизонт — пять лет»", "diamond"],
        ["«ВСЁ. ЭТО КОНЕЦ.»", "panic"],
        ["«Так, откроем график на пяти таймфреймах»", "analyst"],
      ],
    },
    {
      title: "Зелёная свеча улетела в космос. Что дальше?",
      options: [
        ["Прыгаю следом, вдруг не поздно", "fomo"],
        ["Спокойно доедаю семечки", "diamond"],
        ["Проверяю каждую секунду, когда упадёт", "panic"],
        ["Объясняю всем, почему это закономерно", "analyst"],
      ],
    },
    {
      title: "Твой идеальный вечер после торгов?",
      options: [
        ["Искать следующую «ракету»", "fomo"],
        ["Вообще не вспоминать о рынке", "diamond"],
        ["Ещё раз проверить баланс. И ещё раз", "panic"],
        ["Нарисовать стрелочки на графике", "analyst"],
      ],
    },
  ];

  const results = {
    fomo: {
      title: "FOMO-ХОМЯК ↗",
      copy: "Твоё супероружие — энтузиазм. Ты первым замечаешь движуху и последним спрашиваешь, что вообще произошло. Иногда полезно дать лапкам отдохнуть перед кнопкой «Купить».",
      share: "Мой биржевой тип — FOMO-хомяк ↗",
    },
    diamond: {
      title: "АЛМАЗНЫЕ ЛАПКИ ◆",
      copy: "Ты — дзен в мире мигающих котировок. Твой девиз: «Не трогай, оно само». Главное — иногда вспоминать, почему ты вообще держишь свою позицию.",
      share: "Мой биржевой тип — Алмазные лапки ◆",
    },
    panic: {
      title: "ХОМЯК-ПАНИКЁР !!",
      copy: "Ты чувствуешь каждое движение графика всем сердцем. У тебя отлично развит инстинкт самосохранения — осталось научить его отличать свечу от стихийного бедствия.",
      share: "Мой биржевой тип — Хомяк-паникёр !!",
    },
    analyst: {
      title: "ДИВАННЫЙ АНАЛИТИК ◉",
      copy: "У тебя есть теория на любое движение рынка, пара индикаторов и любимое слово «коррекция». Не забывай: даже самый красивый график не умеет заглядывать в будущее.",
      share: "Мой биржевой тип — Диванный аналитик ◉",
    },
  };

  let index = 0;
  let answers = [];

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);

  function focusContent() {
    const heading = app.querySelector(".quiz-question, .quiz-result-title");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }

  function renderQuestion(shouldFocus = false) {
    const question = questions[index];
    const progress = Math.round((index / questions.length) * 100);

    app.innerHTML = `
      <div class="quiz-progress-label"><span>ВОПРОС ${index + 1} ИЗ ${questions.length}</span><span>${progress}% ГОТОВО</span></div>
      <div class="quiz-progress" role="progressbar" aria-label="Прогресс теста" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
        <div class="quiz-progress-bar" style="width:${progress}%"></div>
      </div>
      <h3 class="quiz-question">${escapeHtml(question.title)}</h3>
      <div class="quiz-answers">
        ${question.options.map(([label], optionIndex) => `
          <button class="quiz-answer" type="button" data-answer="${optionIndex}">
            <span class="quiz-letter" aria-hidden="true">${"АБВГ"[optionIndex]}</span>
            <span>${escapeHtml(label)}</span>
          </button>`).join("")}
      </div>
      ${index > 0 ? '<button class="quiz-prev" type="button" data-prev="true">← Вернуться к предыдущему вопросу</button>' : ""}
    `;

    if (shouldFocus) focusContent();
  }

  function getResult() {
    const scores = Object.fromEntries(kinds.map((kind) => [kind, 0]));
    for (const answer of answers) scores[answer] += 1;

    const max = Math.max(...Object.values(scores));
    // If scores tie, the most recent answer decides the result.
    return [...answers].reverse().find((answer) => scores[answer] === max) || "fomo";
  }

  function renderResult() {
    const kind = getResult();
    const result = results[kind];

    app.innerHTML = `
      <span class="quiz-result-kicker">РЕЗУЛЬТАТ ГОТОВ · 4 / 4</span>
      <h3 class="quiz-result-title">${escapeHtml(result.title)}</h3>
      <p class="quiz-result-copy">${escapeHtml(result.copy)}</p>
      <div class="quiz-result-actions">
        <button class="quiz-restart" type="button" data-restart="true">ПРОЙТИ ЕЩЁ РАЗ ↻</button>
        <button class="quiz-share" type="button" data-share="true">СКОПИРОВАТЬ РЕЗУЛЬТАТ ↗</button>
      </div>
      <p class="quiz-feedback" role="status"></p>
    `;

    focusContent();
  }

  app.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button || !app.contains(button)) return;

    if (button.hasAttribute("data-answer")) {
      const selected = Number(button.dataset.answer);
      if (!Number.isInteger(selected) || selected < 0 || selected >= questions[index].options.length) return;
      answers[index] = questions[index].options[selected][1];
      index += 1;
      if (index >= questions.length) renderResult();
      else renderQuestion(true);
      return;
    }

    if (button.hasAttribute("data-prev")) {
      index = Math.max(0, index - 1);
      answers = answers.slice(0, index);
      renderQuestion(true);
      return;
    }

    if (button.hasAttribute("data-restart")) {
      index = 0;
      answers = [];
      renderQuestion(true);
      return;
    }

    if (button.hasAttribute("data-share")) {
      const result = results[getResult()];
      const shareText = `${result.share}\nПроверь своего хомяка: https://hamster.skin/`;
      const feedback = app.querySelector(".quiz-feedback");

      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard not supported");
        await navigator.clipboard.writeText(shareText);
        feedback.textContent = "Скопировано! Теперь можно делиться с другими хомяками 🐹";
      } catch {
        feedback.textContent = `Не удалось скопировать автоматически. Твой результат: ${result.share}`;
      }
    }
  });

  renderQuestion();
})();
