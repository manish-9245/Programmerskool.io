const bar = document.querySelector(".split__bar");
const left = document.querySelector(".split__left");
let mouse_is_down = false;

bar.addEventListener("mousedown", (e) => {
   mouse_is_down = true;
});

document.addEventListener("mousemove", (e) => {
   if (!mouse_is_down) return;

   left.style.width = `${e.clientX}px`;
});

document.addEventListener("mouseup", () => {
   mouse_is_down = false;
});