
    document.addEventListener("DOMContentLoaded", () => {
      const zoomableImages = document.querySelectorAll(".zoomable-img");

      zoomableImages.forEach(img => {
        img.addEventListener("dblclick", () => {
          img.classList.toggle("zoomed");
        });
      });
    });
