function initInfillSliders() {
  document.querySelectorAll("[data-infill-slider]").forEach((slider) => {
    const targetId = slider.dataset.infillTarget;
    const previewId = slider.dataset.infillPreview;
    const target = document.getElementById(targetId);
    const preview = document.getElementById(previewId);

    const update = () => {
      const val = slider.value;
      if (target) target.textContent = `${val}%`;
      if (preview) preview.style.setProperty("--infill-pct", val);
    };

    slider.addEventListener("input", update);
    update();
  });
}

function initColorPickers() {
  document.querySelectorAll(".color-picker").forEach((picker) => {
    const customWrap = picker.querySelector(".color-custom-wrap");
    const radios = picker.querySelectorAll('input[type="radio"]');

    radios.forEach((radio) => {
        radio.addEventListener("change", () => {
        const isCustom = radio.value === "Inny" && radio.checked;
        if (customWrap) customWrap.hidden = !isCustom;
      });
    });
  });
}

export { initInfillSliders, initColorPickers };
